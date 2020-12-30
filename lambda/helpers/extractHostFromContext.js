export default function extractHostFromContext(context) {
  const data = context.clientContext.custom?.netlify
  if (data) {
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    return decoded.site_url
  }

  return 'http://localhost:8888'
}
