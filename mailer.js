const path = require('path');
const templatesDir = path.resolve(__dirname, './views');
const Email = require('email-templates');
const config = require('dotenv').config();
console.log(config)

const mailjet = require('node-mailjet').connect(
  config.parsed.API_KEY,
  config.parsed.SECRET_KEY
);

exports.sendEmail = async (messageInfo, html) => {
     return await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: messageInfo.fromEmail, Name: messageInfo.fromName },
          To: [ { Email: 'ktsolev@yahoo.com', Name: 'Konstantin' } ],
          Subject: messageInfo.subject,
          Email: messageInfo.email,
          TextPart: messageInfo.message,
          HTMLPart: html
        }
      ]
    });
};

exports.sendOne = async (templateName, messageInfo, locals) => {
    // @ts-ignore
    const email = new Email({ views: { root: templatesDir, options: { extension: 'jade' } }});
    let html = await email.render(`${templatesDir}/${templateName}`, locals)
    return await this.sendEmail(messageInfo, html);
};
