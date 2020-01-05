const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Pug = require('jade');
const Joi = require('@hapi/joi');
const common = require('./validations');
const fs = require('fs');
const mailer = require('./mailer');
const os = require('os');
const portfinder = require('portfinder');
const config = require('dotenv').config();

let port = null;

const init = async () => {

    const server = Hapi.server({
        port,
        host: config.parsed.BASE_URL || 'localhost',
        routes: {
          cors: {
              origin: ["*"],
              headers: ["Accept", "Content-Type"],
              additionalHeaders: ["X-Requested-With"]
          }
      }
    });

    await server.start();
    await server.register(Vision);
    
    server.views({
      engines: {
        jade: Pug
      },
      relativeTo: __dirname,
      path: 'views',
      layout: 'email'
    })
    
    console.log('Server running on %s', server.info.uri);

    await server.route({
      method: 'GET',
      path: '/api',
      handler: (request, h) => {
        let response = {};

        response.user = 'mailer';
        response.last = Date.now();
        response.message = 'It works';
        
        console.log(response);
        return h.response(response);
      }
    });
    
    await server.route({
      method: 'POST',
      path: config.parsed.ENDPOINT || '/sendmail',
      options: {
        validate: {
          payload: {
            name: Joi.string().regex(common.onlyLetters, 'name').min(2).max(30).required(),
            email: Joi.string().regex(common.validEmail, 'email').min(2).max(20).required(),
            subject: Joi.string().alphanum().min(2).max(60),
            message: Joi.string().min(2).required()
          },
          failAction: async (request, h, err) => {
            if (process.env.NODE_ENV === 'production') {
                console.error('ValidationError:', err.message);
                throw h.badRequest(`Invalid request payload input`);
            } else {
                writeToFile(err);
                throw err;
            }
         }
        },
      },
      handler: async function (request, h) {
        
        const data = {
          name: request.payload.name,
          email: request.payload.email,
          subject: request.payload.subject,
          message: request.payload.message,
         };
          
          const messageInfo = {
            email: data.email, fromEmail: 'ktsolev@gmail.com',
            fromName: 'Dental-Info', subject: data.subject
          };
          
          try {
            await mailer.sendOne('email', messageInfo, data);
          } catch (error) {
            writeToFile(error);
          }
          return h.view('email', { name: data.name, message: data.message, email: data.email });
      }
    });
};

function writeToFile (data) {
  const filename = __dirname + '/views/error.log';
  fs.appendFile(filename, data + os.EOL , (error) => {
    if (error) throw error;
  });
}


portfinder.getPortPromise()
.then((newPort) => {
  port = newPort;
  writeToFile(`newPort: ${newPort}`);
  init();
})
.catch((err) => {
  writeToFile(err);
});

