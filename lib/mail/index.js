import fs from 'fs'
import nodemailer from 'nodemailer'
import path from 'path'
import Handlebars from 'handlebars'
import env from '../env'
import { EMAIL_TEMPLATES } from '../paths'

const transportConfig = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE === 'true',
  requireTLS: env.EMAIL_REQUIRE_TLS === 'true',
  ...(env.EMAIL_CRT ? {
    tls: {
      ca: fs.readFileSync(env.EMAIL_CRT)
    }
  } : undefined),
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD
  }
}

const transporter = nodemailer.createTransport(transportConfig)

const TEMPLATE_CACHE = {}

export default function ({ from = env.EMAIL_FROM, to, bcc, subject, attachments }, templateName, variables) {
  let template = TEMPLATE_CACHE[templateName]

  if (!template) {
    const templatePath = path.join(EMAIL_TEMPLATES, `${templateName}.hbs`)
    if (!fs.existsSync(templatePath)) {
      console.warn('Missing template file: ', templatePath)

      return
    }

    const templateString = fs.readFileSync(templatePath, 'utf8')

    template = Handlebars.compile(templateString)
    TEMPLATE_CACHE[templateName] = template
  }

  return sendMail({
    from,
    to,
    bcc,
    subject,
    html: template(variables),
    attachments
  })
}

function sendMail (mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error)

        return reject(error)
      }

      if (env.EMAIL_HOST === 'smtp.ethereal.email') {
        console.info('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      }

      return resolve(info)
    })
  })
}

transporter.verify(function (error, success) {
  if (error) {
    console.error(error)
  } else {
    console.info('SMTP server is ready to take our messages')
  }
})
