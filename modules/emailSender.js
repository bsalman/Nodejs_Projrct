const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sbisho280@gmail.com',
        pass: '015750469819'
    }
})
function sendEmail(name, email, subject, message, callback) {

    const mailOption ={
        from: 'sbisho280@gmail.com',
        to: 'emailtosendto@bla.com',
        subject: subject,
        text: email + '\n' + name + '\n' + message
    }
    transporter.sendMail(mailOption, function (error, info) {
        if(error){
            console.log(error);
            callback(false);
            
        } else {
            console.log(info.response);
            callback(true);
        }
      })

  }

  module.exports = { sendEmail }