const nodemailer = require('nodemailer');
const path = require('path');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Lost & Found Pet Network!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for joining our community dedicated to helping pets find their way home.</p>
        <p>You can now:</p>
        <ul>
          <li>Post about missing pets</li>
          <li>Report found pets</li>
          <li>Search for pets in your area</li>
          <li>Connect with other pet owners</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  emailVerification: (userName, verificationLink) => ({
    subject: 'Verify Your Email - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
        <p>Hello ${userName},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7f8c8d;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  passwordReset: (userName, resetLink) => ({
    subject: 'Password Reset Request - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7f8c8d;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  postApproved: (userName, petName) => ({
    subject: 'Your Pet Post Has Been Approved - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Post Approved!</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your post about <strong>${petName}</strong> has been approved and is now live on our platform.</p>
        <p>Your post will now be visible to other users who can help in the search.</p>
        <p>We'll notify you if anyone contacts you about your pet.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  postEdited: (userName, petName) => ({
    subject: 'Your Pet Post Has Been Edited - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f39c12;">Post Edited</h2>
        <p>Hello ${userName},</p>
        <p>Your post about <strong>${petName}</strong> has been edited by our moderation team.</p>
        <p>Please review the changes and contact us if you have any questions.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  petFoundMatch: (userName, petName, contactInfo) => ({
    subject: 'Potential Match Found for Your Pet - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Potential Match Found!</h2>
        <p>Hello ${userName},</p>
        <p>Someone has found a pet that matches the description of <strong>${petName}</strong>.</p>
        <p>Contact Information:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contactInfo.name}</p>
          <p><strong>Email:</strong> ${contactInfo.email}</p>
          <p><strong>Phone:</strong> ${contactInfo.phone}</p>
          ${contactInfo.message ? `<p><strong>Message:</strong> ${contactInfo.message}</p>` : ''}
        </div>
        <p>Please contact them as soon as possible to arrange a meeting.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  contactRequest: (userName, petName, contactInfo) => ({
    subject: 'Contact Request for Your Pet - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Contact Request</h2>
        <p>Hello ${userName},</p>
        <p>Someone is interested in your post about <strong>${petName}</strong> and would like to contact you.</p>
        <p>Contact Information:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contactInfo.name}</p>
          <p><strong>Email:</strong> ${contactInfo.email}</p>
          <p><strong>Phone:</strong> ${contactInfo.phone}</p>
          ${contactInfo.message ? `<p><strong>Message:</strong> ${contactInfo.message}</p>` : ''}
        </div>
        <p>Please respond to them as soon as possible.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  accountLocked: (userName) => ({
    subject: 'Account Temporarily Locked - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Account Locked</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>This is a security measure to protect your account. Your account will be unlocked automatically after 2 hours.</p>
        <p>If you forgot your password, you can request a password reset.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  reportReceived: (userName, reportType) => ({
    subject: 'Report Received - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f39c12;">Report Received</h2>
        <p>Hello ${userName},</p>
        <p>We have received your report about ${reportType}.</p>
        <p>Our moderation team will review it and take appropriate action if necessary.</p>
        <p>We'll notify you once the report has been resolved.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  }),

  reportResolved: (userName, reportType, action) => ({
    subject: 'Report Resolved - Lost & Found Pet Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Report Resolved</h2>
        <p>Hello ${userName},</p>
        <p>Your report about ${reportType} has been resolved.</p>
        <p>Action taken: ${action}</p>
        <p>Thank you for helping keep our community safe.</p>
        <p>Best regards,<br>The Lost & Found Pet Network Team</p>
      </div>
    `
  })
};

const sendEmail = async (to, template, ...args) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template];
    
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = typeof emailTemplate === 'function' 
      ? emailTemplate(...args) 
      : emailTemplate;

    const mailOptions = {
      from: `"Lost & Found Pet Network" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendBulkEmails = async (recipients, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template];
    
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = typeof emailTemplate === 'function' 
      ? emailTemplate(data) 
      : emailTemplate;

    const mailOptions = {
      from: `"Lost & Found Pet Network" <${process.env.EMAIL_USER}>`,
      bcc: recipients,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Bulk email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
};

const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  emailTemplates
}; 