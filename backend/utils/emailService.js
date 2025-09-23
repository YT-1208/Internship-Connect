const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'internshipconnect.noreply@gmail.com',
    pass: 'dvht txqw roen kcpk',
  },

  // Add logging for transporter
  logger: true, // Enable logging to console
  debug: true // Enable debug output
});

const sendRegistrationEmail = async (toEmail, username) => {
  const mailOptions = {
    from: 'internshipconnect.noreply@gmail.com',
    to: toEmail,
    subject: 'Welcome to Internship Connect!',
    html: `
      <p>Dear ${username},</p>
      <p>Welcome to Internship Connect! We are excited to have you on board.</p>
      <p>You can now explore various internship opportunities and connect with top employers.</p>
      <p>Best regards,</p>
      <p>The Internship Connect Team</p>
    `,
  };

  try {
    console.log(`Attempting to send email to: ${toEmail} for user: ${username}`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent successfully. Message ID:', info.messageId);
    console.log('Preview URL (if available):', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending registration email to', toEmail, ':', error);
    if (error.response) {
      console.error('Nodemailer response error:', error.response);
    }
  }
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: 'internshipconnect.noreply@gmail.com',
    to: toEmail,
    subject: 'Password Reset Request for Internship Connect',
    html: `
      <p>Dear User,</p>
      <p>You have requested to reset your password for your Internship Connect account.</p>
      <p>Please click on the following link to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The Internship Connect Team</p>
    `,
  };

  try {
    console.log(`Attempting to send password reset email to: ${toEmail}`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending password reset email to', toEmail, ':', error);
    if (error.response) {
      console.error('Nodemailer response error:', error.response);
    }
  }
};

const sendPasswordUpdateConfirmationEmail = async (toEmail) => {
  const mailOptions = {
    from: 'internshipconnect.noreply@gmail.com',
    to: toEmail,
    subject: 'Your Internship Connect Password Has Been Updated',
    html: `
      <p>Dear User,</p>
      <p>This is a confirmation that the password for your Internship Connect account has been successfully updated.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>Best regards,</p>
      <p>The Internship Connect Team</p>
    `,
  };

  try {
    console.log(`Attempting to send password update confirmation email to: ${toEmail}`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Password update confirmation email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending password update confirmation email to', toEmail, ':', error);
    if (error.response) {
      console.error('Nodemailer response error:', error.response);
    }
  }
};

const sendVerificationEmail = async (toEmail, username) => {
  const mailOptions = {
    from: 'internshipconnect.noreply@gmail.com',
    to: toEmail,
    subject: 'Your Internship Connect Account has been Verified!',
    html: `
      <p>Dear ${username},</p>
      <p>Congratulations! Your Internship Connect account has been verified by your university.</p>
      <p>You now have full access to all features, including applying for internships.</p>
      <p>Best regards,</p>
      <p>The Internship Connect Team</p>
    `,
  };

  try {
    console.log(`Attempting to send verification email to: ${toEmail} for user: ${username}`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending verification email to', toEmail, ':', error);
    if (error.response) {
      console.error('Nodemailer response error:', error.response);
    }
  }
};

const sendRemovalEmail = async (toEmail, username) => {
  const mailOptions = {
    from: 'internshipconnect.noreply@gmail.com',
    to: toEmail,
    subject: 'Your Internship Connect Account has been Removed',
    html: `
      <p>Dear ${username},</p>
      <p>Your Internship Connect account has been removed by your university.</p>
      <p>If you believe this is a mistake, please contact your university's administration.</p>
      <p>Best regards,</p>
      <p>The Internship Connect Team</p>
    `,
  };

  try {
    console.log(`Attempting to send removal email to: ${toEmail} for user: ${username}`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Removal email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending removal email to', toEmail, ':', error);
    if (error.response) {
      console.error('Nodemailer response error:', error.response);
    }
  }
};

module.exports = { sendRegistrationEmail, sendPasswordResetEmail, sendPasswordUpdateConfirmationEmail, sendVerificationEmail, sendRemovalEmail };