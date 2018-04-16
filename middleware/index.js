const path = require('path')
const ip = require('ip')
const bodyParser = require('koa-bodyparser')
const nunjucks = require('koa-nunjucks-2')
const staticFiles = require('koa-static')

// send json middleware
const miSend = require('./mi-send')
// logger middleware
const miLog = require('./mi-log')
const miHttpError = require('./mi-http-error')
module.exports = (app) => {
  app.use(miHttpError({
    errorPageFolder: path.resolve(__dirname, '../errorPage')
  }))

  // app.use(miLog({
  //   env: app.env,
  //   projectName: 'koa2',
  //   dir: 'logs',
  //   serverIp: ip.address()
  // }))

  app.use(staticFiles(path.resolve(__dirname, '../public')))

  app.use(nunjucks({
    ext: 'html',
    path: path.join(__dirname, '../views'),
    nunjucksConfig: {
      trimBlocks: true
    }
  }))

  app.use(bodyParser())
  
  app.use(miSend())

  app.on('error', (err, ctx) => {
    if (ctx && !ctx.headerSent && ctx.status < 500) {
      ctx.status = 500
    }
    if (ctx && ctx.log && ctx.log.error) {
      if (!ctx.state.logged) {
        ctx.log.error(err.stack)
      }
    }
  })
}