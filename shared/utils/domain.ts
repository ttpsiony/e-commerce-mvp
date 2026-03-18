export const getSiteUrl = () => {
  const siteUrl = process.env.SITE_URL
  const hostname = process.env.HOSTNAME
  const port = process.env.PORT

  const configuredUrl = siteUrl || (hostname ? `${hostname}${port ? `:${port}` : ''}` : undefined)

  if (!configuredUrl) return 'http://localhost:3000'
  if (configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://')) {
    return configuredUrl.replace(/\/$/, '')
  }
  return `https://${configuredUrl.replace(/\/$/, '')}`
}
