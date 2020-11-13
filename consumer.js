'use strict'

function fastifyConsumerPlugin(fastify, opts, done) {
  try {

    fastify.get('/ws/:room', { websocket: true }, handler)

    done()
  } catch(error) {
    done(error)
  }
}


// A websocket handle function (called once after a handshake)
async function handler(connection, req, params) {
  const fastify = this

  try {
    // Creates a tunnel object to access a channel associated with the room.
    const tunnel = await fastify.channels.use(params.room);

    // Subscribes for messages.
    await fastify.channels.subscribe(tunnel);

    // Starts a consumer.
    consume(fastify, connection, tunnel)
      .then((resolve) => {
        console.log('Consumer finished')
      })
      .catch((reject) => {
        connection.socket.close();
        return;
      })

    // Produces recieved form a websocket messages to the corresponding tunnel.
    connection.socket.on('message', async (message) => {
      try {
        connection.resume()
        await fastify.channels.produce(tunnel, message)
      } catch (error) {
        connection.socket.close();
        return;
      }
    })

    // Unsubscribe on websocket close
    connection.socket.on('close', async () => {
      await fastify.channels.unsubscribe(tunnel)
    })
  }
  catch(error) {
    connection.socket.close();
  }
}

// A consumer implementation
// Consumes messages from the tunnel and broadcast them to the websocket.
async function consume(fastify, connection, tunnel) {
  for await (const messages of fastify.channels.consume(tunnel)) {
    for (const i in messages) {
      connection.socket.send(messages[i].data);
    }
  }
}

module.exports = fastifyConsumerPlugin
