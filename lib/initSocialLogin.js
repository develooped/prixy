import passport from 'passport'
import FacebookStrategy from 'passport-facebook-token'
import GoogleStrategy from './patched/passport-google-token'
import DropboxStrategy from './patched/passport-dropbox-token'

import env from './env'
import prisma from './prismaClient'
import signToken from './util/signToken'

const defaultProfileHandler = type => async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  const userFields = {
    name: profile.displayName,
    email: profile.emails[0].value,
    [`${type}UserId`]: profile.id,
    [`${type}AccessToken`]: accessToken,
    [`${type}RefreshToken`]: refreshToken
  }

  try {
    const user = await prisma.upsertUser({
      where: {
        email: userFields.email
      },
      update: userFields,
      create: userFields
    })

    return done(null, user)
  } catch (err) {
    console.error(err)

    return done(err, null)
  }
}

const defaultTokenBuilder = res => (err, user, info, status) => {
  if (err || (!user && info.stack)) {
    console.error(err || info)

    return res.status(401).json({
      status: 'authorization-failure'
    })
  }

  res.json({
    token: signToken(user),
    user
  })
}

export default function (
  app,
  profileHandler = defaultProfileHandler,
  tokenBuilder = defaultTokenBuilder
) {
  console.log('Initializing social login handlers')

  if (env.FACEBOOK_APP_ID) {
    passport.use(
      new FacebookStrategy(
        {
          fbGraphVersion: env.FACEBOOK_GRAPH_VERSION || 'v4.0',
          enableProof: true,
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET
        },
        profileHandler('facebook')
      )
    )
  }

  if (env.GOOGLE_APP_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_APP_ID,
          clientSecret: env.GOOGLE_APP_SECRET
        },
        profileHandler('google')
      )
    )
  }

  if (env.DROPBOX_APP_ID) {
    passport.use(
      new DropboxStrategy(
        {
          apiVersion: '2',
          clientID: env.DROPBOX_APP_ID,
          clientSecret: env.DROPBOX_APP_SECRET
        },
        profileHandler('dropbox')
      )
    )
  }

  app.use(passport.initialize())

  if (env.FACEBOOK_APP_ID) {
    app.post('/auth/facebook', (req, res, next) => {
      passport.authenticate('facebook-token', tokenBuilder(res))(req, res, next)
    })
  }

  if (env.GOOGLE_APP_ID) {
    app.post('/auth/google', (req, res, next) => {
      passport.authenticate('google-token', tokenBuilder(res))(req, res, next)
    })
  }

  if (env.DROPBOX_APP_ID) {
    app.post('/auth/dropbox', (req, res, next) => {
      passport.authenticate('dropbox-token', tokenBuilder(res))(req, res, next)
    })
  }
}
