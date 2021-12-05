require('dotenv').config();
const emailHTML = require('./emailHTML');

module.exports = async function sendConfirmationCode(url, email) {
	const emailHTML = require('./emailHTML');
	require('dotenv').config();
	
	var nodemailer = require('nodemailer');
	
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: process.env.GMAIL,
		pass: process.env.PASSWORD
	  }
	});
	
	var mailOptions = {
		from: process.env.GMAIL,
		to: email,
		subject: 'Please Verify Your Giftee Account',
		html: emailHTML(url)
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	}); 
}