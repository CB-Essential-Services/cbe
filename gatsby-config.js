require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
  })

const siteMetadata = require('./site-metadata.json')
const {createProxyMiddleware} = require('http-proxy-middleware'); //v1.x.x

module.exports = {
    pathPrefix: '/',
    siteMetadata: siteMetadata,
    developMiddleware: (app) => {
        app.use(
          '/.netlify/functions/',
          createProxyMiddleware({
            target: 'http://localhost:9000',
            pathRewrite: {
              '/.netlify/functions/': '',
            },
          })
        );
      },
    plugins: [
        `gatsby-plugin-react-helmet`,
        `gatsby-source-data`,
        `gatsby-transformer-remark`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `pages`,
                path: `${__dirname}/src/pages`
            }
        },
        {
            resolve: `gatsby-plugin-sass`,
            options: {}
        },
        {
            resolve: `gatsby-remark-page-creator`,
            options: {}
        },
        {
            resolve: `@stackbit/gatsby-plugin-menus`,
            options: {
                sourceUrlPath: `fields.url`,
                pageContextProperty: `menus`,
            }
        }
    ]
};
