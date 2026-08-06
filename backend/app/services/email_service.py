import smtplib
import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from backend.app.config.settings import Config

logger = logging.getLogger(__name__)

class EmailService:
    """Enterprise SMTP Email Service supporting HTML, PlainText, and Multi-part Attachments"""

    @classmethod
    def _create_smtp_connection(cls) -> smtplib.SMTP:
        """Establish a secure TLS connection with the configured SMTP mail server"""
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        return server

    @classmethod
    def send_email(cls, to_email: str, subject: str, html_content: str, text_content: str = "", attachment_path: str = None) -> bool:
        """Send standard HTML / text emails with optional file attachments"""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"FinSight Platform <{Config.SMTP_USER}>"
            msg["To"] = to_email

            # Attach plain text and HTML bodies
            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            if html_content:
                msg.attach(MIMEText(html_content, "html"))

            # Handle file attachment if specified and exists
            if attachment_path:
                if os.path.exists(attachment_path):
                    multipart_msg = MIMEMultipart("mixed")
                    multipart_msg["Subject"] = msg["Subject"]
                    multipart_msg["From"] = msg["From"]
                    multipart_msg["To"] = msg["To"]
                    
                    # Move previous alternative parts inside the mixed container
                    multipart_msg.attach(msg)
                    
                    filename = os.path.basename(attachment_path)
                    with open(attachment_path, "rb") as f:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f"attachment; filename={filename}",
                        )
                        multipart_msg.attach(part)
                    msg = multipart_msg
                else:
                    logger.warning(f"Requested attachment file not found at path: {attachment_path}")

            # Connect and deliver
            server = cls._create_smtp_connection()
            server.sendmail(Config.SMTP_USER, to_email, msg.as_string())
            server.quit()
            logger.info(f"Successfully dispatched email to {to_email} with subject: {subject}")
            return True

        except Exception as e:
            logger.error(f"SMTP execution failed: {str(e)}")
            return False

    @classmethod
    def send_password_reset_email(cls, to_email: str, user_name: str, reset_link: str) -> bool:
        """Deliver customized secure HTML password reset links with fallback support"""
        subject = "Reset Your FinSight Account Password"
        
        html_content = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">FinSight Password Reset Request</h2>
            <p style="color: #475569; font-size: 16px; line-height: 24px;">Hello {user_name},</p>
            <p style="color: #475569; font-size: 16px; line-height: 24px;">
                We received a request to reset your password. Click the secure link below to proceed:
            </p>
            <div style="margin: 24px 0; text-align: center;">
                <a href="{reset_link}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 20px;">
                Or copy and paste this URL into your browser: <br/>
                <a href="{reset_link}" style="color: #0284c7;">{reset_link}</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                If you did not request this reset, you can safely ignore this email.
            </p>
        </div>
        """
        
        text_content = f"Hello {user_name},\n\nWe received a password reset request. Please use the link below to reset your password:\n{reset_link}\n\nIf you did not make this request, ignore this email."
        
        return cls.send_email(to_email, subject, html_content, text_content)

    @classmethod
    def send_report_email(cls, to_email: str, user_name: str, report_type: str, file_path: str) -> bool:
        """Deliver generated financial statements to the user's registered inbox"""
        subject = f"Your FinSight {report_type.capitalize()} Financial Statement"
        
        html_content = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Your Financial Statement is Ready</h2>
            <p style="color: #475569; font-size: 16px; line-height: 24px;">Hello {user_name},</p>
            <p style="color: #475569; font-size: 16px; line-height: 24px;">
                Your requested <strong>{report_type.capitalize()} Report</strong> has been successfully generated and is attached to this email.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 24px;">
                You can also access, download, and analyze your historic statements any time in the <strong>Reports</strong> tab inside the platform.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                Sent securely by the FinSight Automated Statement Engine.
            </p>
        </div>
        """
        
        text_content = f"Hello {user_name},\n\nYour requested {report_type.capitalize()} Report is ready and attached to this email.\n\nBest regards,\nFinSight Platform"
        
        return cls.send_email(to_email, subject, html_content, text_content, attachment_path=file_path)
