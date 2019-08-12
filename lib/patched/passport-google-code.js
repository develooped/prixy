/**
 * Module dependencies.
 */
const util = require('util')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy
const InternalOAuthError = require('passport-oauth').InternalOAuthError

/**
 * `Strategy` constructor.
 *
 * The Google authentication strategy authenticates requests by delegating to
 * Google using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Google application's client id
 *   - `clientSecret`  your Google application's client secret
 *   - `callbackURL`   URL to which Google will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new GoogleStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/google/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function GoogleTokenStrategy (options, verify) {
  options = options || {}
  options.authorizationURL =
    options.authorizationURL || 'https://accounts.google.com/o/oauth2/v2/auth'
  options.tokenURL =
    options.tokenURL || 'https://www.googleapis.com/oauth2/v4/token'

  OAuth2Strategy.call(this, options, verify)
  this.name = 'google-code'
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(GoogleTokenStrategy, OAuth2Strategy)

/**
 * Retrieve user profile from Google.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `google`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
GoogleTokenStrategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    accessToken,
    function (err, body, res) {
      if (err) {
        return done(
          new InternalOAuthError('failed to fetch user profile', err)
        )
      }

      try {
        var json = JSON.parse(body)

        var profile = { provider: 'google' }
        profile.sub = json.sub
        profile.id = json.id || json.sub
        profile.displayName = json.name
        profile.name = {
          givenName: json.given_name,
          familyName: json.family_name
        }
        profile.given_name = json.given_name
        profile.family_name = json.family_name
        if (json.birthday) profile.birthday = json.birthday
        if (json.relationshipStatus) {
          profile.relationship = json.relationshipStatus
        }
        if (json.objectType && json.objectType === 'person') {
          profile.isPerson = true
        }
        if (json.isPlusUser) profile.isPlusUser = json.isPlusUser
        if (json.email_verified !== undefined) {
          profile.email_verified = json.email_verified
          profile.verified = json.email_verified
        }
        if (json.placesLived) profile.placesLived = json.placesLived
        if (json.language) profile.language = json.language
        if (!json.language && json.locale) {
          profile.language = json.locale
          profile.locale = json.local
        }
        if (json.emails) {
          profile.emails = json.emails

          profile.emails.some(function (email) {
            if (email.type === 'account') {
              profile.email = email.value
              return true
            }
          })
        }
        if (!profile.email && json.email) {
          profile.email = json.email
        }
        if (!profile.emails && profile.email) {
          profile.emails = [
            {
              value: profile.email,
              type: 'account'
            }
          ]
        }
        if (json.gender) profile.gender = json.gender
        if (!json.domain && json.hd) json.domain = json.hd
        if (json.image && json.image.url) {
          let photo = {
            value: json.image.url
          }
          if (json.image.isDefault) photo.type = 'default'
          profile.photos = [photo]
        }
        if (!json.image && json.picture) {
          let photo = {
            value: json.picture
          }
          photo.type = 'default'
          profile.photos = [photo]
          profile.picture = json.picture
        }
        if (json.cover && json.cover.coverPhoto && json.cover.coverPhoto.url) {
          profile.coverPhoto = json.cover.coverPhoto.url
        }

        profile._raw = body
        profile._json = json

        done(null, profile)
      } catch (e) {
        done(e)
      }
    }
  )
}

/**
 * Load user profile, contingent upon options.
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api private
 */
GoogleTokenStrategy.prototype._loadUserProfile = function (accessToken, done) {
  var self = this

  function loadIt () {
    return self.userProfile(accessToken, done)
  }
  function skipIt () {
    return done(null)
  }

  if (
    typeof this._skipUserProfile === 'function' &&
    this._skipUserProfile.length > 1
  ) {
    // async
    this._skipUserProfile(accessToken, function (err, skip) {
      if (err) {
        return done(err)
      }
      if (!skip) {
        return loadIt()
      }
      return skipIt()
    })
  } else {
    var skip =
      typeof this._skipUserProfile === 'function'
        ? this._skipUserProfile()
        : this._skipUserProfile
    if (!skip) {
      return loadIt()
    }
    return skipIt()
  }
}

/**
 * Expose `GoogleTokenStrategy`.
 */
module.exports = GoogleTokenStrategy
