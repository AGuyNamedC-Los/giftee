const emailHTML = require('./emailHTML');

module.exports = async function sendConfirmationCode(email, emailCode) {
	const sgMail = require('@sendgrid/mail');
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	
	const msg = {
	  to: email, // Change to your recipient
	  from: process.env.GMAIL, // Change to your verified sender
	  subject: 'Welcome to Giftee! Confirm Your Email',
	  text: `Here is your confirmation code: ${emailCode}`,
	  html: emailHTML(emailCode)
	}
	
	sgMail.send(msg)
	  .then(() => {
		console.log('Email sent');
	  })
	  .catch((error) => {
		console.error(error);
	  })
}