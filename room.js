'use strict'

function fastifyPluginRoom (fastify, opts, done) {

  // Route to the room
  fastify.get('/:room', (request, replay) => {
    replay.type('text/html').send(view(request.params.room))
  })

  done()
}

// Builds a page view with a text area, input field and a submit button.
function view (room) {
  const page = `

  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Chat room '${room}'</title>
  </head>
  <body>
    <textarea id="log" cols="100" rows="20" readonly></textarea><br>
    <input id="input" type="text" size="100"><br>
    <input id="submit" type="button" value="Send"> to room '${room}'
    
    <script>
      const ws = new WebSocket(
        'ws://' + window.location.host + '/ws/' + '${room}'
      );

      ws.onmessage = function(e) {
        const data = JSON.parse(e.data);
        document.querySelector('#log').value += (data.message + '\\n');
      };

      ws.onclose = function(e) {
        console.error('socket closed');
      }

      document.querySelector('#input').focus();
      document.querySelector('#input').onkeyup = function(e) {
        if (e.keyCode === 13) {
          document.querySelector('#submit').click();
        }
      };

      document.querySelector('#submit').onclick = function(e) {
        const inputElem = document.querySelector('#input');
        ws.send(JSON.stringify({ 'message': inputElem.value }));
        inputElem.value = '';
      };
    </script>
  </body>
  </html>
  `
  return page
}

module.exports = fastifyPluginRoom
