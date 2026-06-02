const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using SMTP config if present
const isSmtpConfigured = () => {
  return (
    process.env.SMTP_USER &&
    process.env.SMTP_USER.trim() !== '' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS.trim() !== ''
  );
};

let transporter = null;
if (isSmtpConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: (process.env.SMTP_PORT === '465'), // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Visual console logging fallback for development
const logEmailToConsole = (to, subject, htmlContent, textContent) => {
  console.log('\n' + '='.repeat(80));
  console.log(`✉️  [EMAIL NOTIFICATION SENT] (DEV MODE - SMTP NOT CONFIGURED)`);
  console.log(`📍 To:       ${to}`);
  console.log(`📌 Subject:  ${subject}`);
  console.log('-'.repeat(80));
  console.log(textContent);
  console.log('='.repeat(80) + '\n');
};

const sendMail = async ({ to, subject, html, text }) => {
  if (isSmtpConfigured()) {
    try {
      const info = await transporter.sendMail({
        from: `"LeaveTracker Admin" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`[Mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Mailer] Error sending email via SMTP to ${to}:`, error);
      // Fallback to console log on error so execution doesn't block
      logEmailToConsole(to, subject, html, text);
      return false;
    }
  } else {
    logEmailToConsole(to, subject, html, text);
    return true;
  }
};

/**
 * Send OTP Verification Email
 */
exports.sendOtpEmail = async (toEmail, otp) => {
  const subject = 'Your LeaveTracker OTP Verification Code';
  const text = `Your OTP Verification Code is: ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 10px 18px; border-radius: 12px; font-weight: bold; font-size: 20px; display: inline-block;">🌴 LeaveTracker</span>
      </div>
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; text-align: center; margin-top: 0;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Thank you for starting your registration. Use the security code below to verify your email address. This code is valid for 10 minutes.
      </p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-bottom: 0;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, html, text });
};

/**
 * Send Leave Approval Email
 */
exports.sendLeaveApprovalEmail = async (toEmail, employeeName, leaveType, startDate, endDate) => {
  const subject = '🎉 Your Leave Request Has Been Approved!';
  const text = `Hello ${employeeName},\n\nWe are pleased to inform you that your request for ${leaveType} from ${startDate} to ${endDate} has been approved.\n\nBest regards,\nLeaveTracker Team`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 18px; border-radius: 12px; font-weight: bold; font-size: 20px; display: inline-block;">🌴 LeaveTracker</span>
      </div>
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; text-align: center; margin-top: 0;">Leave Request Approved!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Hello <strong>${employeeName}</strong>,
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Great news! Your manager has approved your leave request. Here are the details:
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px; color: #166534; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Leave Type:</td>
            <td style="padding: 4px 0; text-align: right;">${leaveType}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Start Date:</td>
            <td style="padding: 4px 0; text-align: right;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">End Date:</td>
            <td style="padding: 4px 0; text-align: right;">${endDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Status:</td>
            <td style="padding: 4px 0; text-align: right;"><span style="background-color: #10b981; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">Approved</span></td>
          </tr>
        </table>
      </div>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
        You can check your updated balances on the LeaveTracker dashboard.
      </p>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          This is an automated notification. Please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: toEmail, subject, html, text });
};

/**
 * Send Leave Rejection Email
 */
exports.sendLeaveRejectionEmail = async (toEmail, employeeName, leaveType, startDate, endDate, remarks) => {
  const subject = 'Leave Request Update: Rejected';
  const text = `Hello ${employeeName},\n\nWe regret to inform you that your request for ${leaveType} from ${startDate} to ${endDate} has been rejected.\nRemarks: ${remarks || 'None'}\n\nBest regards,\nLeaveTracker Team`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 10px 18px; border-radius: 12px; font-weight: bold; font-size: 20px; display: inline-block;">🌴 LeaveTracker</span>
      </div>
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; text-align: center; margin-top: 0;">Leave Request Update</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Hello <strong>${employeeName}</strong>,
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        We wish to inform you that your leave request has been reviewed and was not approved. Here are the details:
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px; color: #991b1b; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Leave Type:</td>
            <td style="padding: 4px 0; text-align: right;">${leaveType}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Start Date:</td>
            <td style="padding: 4px 0; text-align: right;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">End Date:</td>
            <td style="padding: 4px 0; text-align: right;">${endDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Status:</td>
            <td style="padding: 4px 0; text-align: right;"><span style="background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">Rejected</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 0 4px 0; font-weight: bold; border-t: 1px solid #fee2e2;" colspan="2">Manager Remarks:</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-style: italic; color: #7f1d1d;" colspan="2">
              ${remarks || 'No remarks provided.'}
            </td>
          </tr>
        </table>
      </div>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
        Your pending leave balance allocation has been restored.
      </p>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          This is an automated notification. Please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: toEmail, subject, html, text });
};
