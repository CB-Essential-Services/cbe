import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const client = {
  ...sgMail,
  send: (msg) =>
    sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL,
      mailSettings: {
        sandboxMode: {
          enable: Boolean(process.env.SENDGRID_SANDBOX_MODE),
        },
      },
      ...msg,
    }),
}

export default client
