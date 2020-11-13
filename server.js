'use strict'

const fastify = require('fastify')()

fastify.register(require('fastify-websocket'))
fastify.after(error => {
   if (error) console.log(error)
})

fastify.register(require('fastify-redis-channels'), {
  channels: {
    application: 'example',
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
})
fastify.after(error => {
   if (error) console.log(error)
})

fastify.register(require('./consumer'))
fastify.after(error => {
   if (error) console.log(error)
})

fastify.register(require('./room'))
fastify.ready(error => {
  if (error) console.log(error)
})

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) console.log(error)
  console.log('Listen on : ', address)
})
