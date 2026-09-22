import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { IOrder } from '../models/Order';

export class EmailService {
  private static getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  /**
   * Generates a modern, responsive HTML email template for order confirmation
   */
  public static generateOrderEmailHtml(order: IOrder): string {
    const trackingUrl = `${config.CLIENT_URL}/track-order?orderId=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(order.customer.phone)}`;
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #EBF1EB;">
            <div style="font-weight: 700; color: #171A18; font-size: 15px; line-height: 1.3;">${item.title}</div>
            <div style="color: #7F8681; font-size: 12px; margin-top: 4px;">SKU: <span style="font-family: monospace; font-weight: 600;">${item.sku}</span> &bull; Quantity: <strong>${item.quantity}</strong></div>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #EBF1EB; text-align: right; font-weight: 800; color: #171A18; font-size: 15px;">
            PKR ${item.total.toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${order.orderId} | Organiva Pakistan</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 28px 12px; color: #2E332F;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2ECE3; box-shadow: 0 10px 30px rgba(23, 35, 25, 0.06);">
        
        <!-- Header Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, #172319 0%, #233726 100%); padding: 36px 40px; text-align: center;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; margin-bottom: 6px;">ORGANIVA</div>
            <div style="font-size: 12px; color: #9FC4A3; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Smart Products &bull; Simpler Living</div>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding: 36px 36px 28px 36px;">
            
            <!-- Status Badge -->
            <div style="display: inline-block; background-color: #EBF1EB; color: #435845; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding: 6px 14px; border-radius: 999px; margin-bottom: 20px;">
              Order Confirmed &bull; #${order.orderId}
            </div>

            <!-- Warm Greeting -->
            <h1 style="font-size: 24px; font-weight: 800; color: #171A18; margin: 0 0 12px 0; line-height: 1.3;">
              Assalam-o-alaikum, ${order.customer.fullName}!
            </h1>
            <p style="font-size: 15px; color: #525B54; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for ordering with <strong>Organiva Pakistan</strong>! We have received your order and our fulfillment hub has initiated the inspection and packaging process.
            </p>

            <!-- Order Snapshot Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAF8; border-radius: 14px; border: 1px solid #E2ECE3; padding: 18px 20px; margin-bottom: 28px;">
              <tr>
                <td style="vertical-align: top; width: 50%;">
                  <div style="font-size: 11px; color: #7F8681; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Order Reference</div>
                  <div style="font-size: 16px; font-weight: 900; color: #171A18; font-family: monospace; margin-top: 3px;">${order.orderId}</div>
                </td>
                <td style="vertical-align: top; width: 50%; text-align: right;">
                  <div style="font-size: 11px; color: #7F8681; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Payment Method</div>
                  <div style="font-size: 14px; font-weight: 800; color: #435845; margin-top: 3px;">
                    ${order.paymentMethod} <span style="font-size: 12px; font-weight: 600; color: #7F8681;">(${order.paymentStatus})</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Items Ordered -->
            <div style="font-size: 12px; font-weight: 800; color: #171A18; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; border-bottom: 2px solid #EBF1EB; padding-bottom: 6px;">
              Order Summary
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              ${itemsHtml}
            </table>

            <!-- Cost Breakdown -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; font-size: 14px; color: #525B54;">
              <tr>
                <td style="padding: 6px 0;">Subtotal</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #171A18;">PKR ${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;">Nationwide Express Courier</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #2E7D32;">
                  ${order.shipping === 0 ? 'FREE (Special Promotion)' : `PKR ${order.shipping.toLocaleString()}`}
                </td>
              </tr>
              <tr>
                <td style="padding: 14px 0 0 0; border-top: 2px solid #EBF1EB; font-size: 16px; font-weight: 900; color: #171A18;">Total Payable</td>
                <td style="padding: 14px 0 0 0; border-top: 2px solid #EBF1EB; text-align: right; font-size: 20px; font-weight: 900; color: #435845;">
                  PKR ${order.total.toLocaleString()}
                </td>
              </tr>
            </table>

            <!-- Shipping Destination Card -->
            <div style="background-color: #F8FAF8; border-radius: 14px; border: 1px solid #E2ECE3; padding: 20px; margin-bottom: 30px;">
              <div style="font-size: 11px; font-weight: 800; color: #7F8681; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                Shipping & Contact Details
              </div>
              <div style="font-size: 14px; color: #171A18; line-height: 1.6;">
                <strong>${order.customer.fullName}</strong><br/>
                ${order.customer.address}<br/>
                ${order.customer.city}, Pakistan<br/>
                <span style="color: #525B54; font-size: 13px;">Phone: <strong>${order.customer.phone}</strong> &bull; Email: ${order.customer.email}</span>
              </div>
            </div>

            <!-- 1-Click Track Order CTA -->
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #5B755D; color: #FFFFFF; font-weight: 800; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(91, 117, 93, 0.35); letter-spacing: 0.3px;">
                Track Your Order in Real-Time &rarr;
              </a>
              <div style="margin-top: 10px; font-size: 12px; color: #7F8681;">
                Click above to view real-time live dispatch and courier tracking updates.
              </div>
            </div>

            <!-- Delivery & Return Assurances -->
            <div style="background-color: #EBF1EB; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 13px; color: #2E332F; line-height: 1.5;">
                    <strong style="color: #435845;">&check; 7-Day Hassle-Free Replacement Guarantee:</strong> If your parcel arrives damaged or with any defect, we will exchange it immediately with zero courier fees.<br/>
                    <strong style="color: #435845;">&check; Dispatch Timeline:</strong> Dispatched via top couriers (Trax, Leopard, TCS, PostEx) within 24 hours. Expected delivery is 2 to 4 business days.
                  </td>
                </tr>
              </table>
            </div>

            <!-- WhatsApp Helpline Button -->
            <div style="padding: 16px; border-radius: 12px; background-color: #F0FAF3; border: 1px solid #B8E8C7; text-align: center; font-size: 13px; color: #185A2B;">
              Need instant assistance with this order? Chat with our team on WhatsApp:
              <br/>
              <a href="https://wa.me/${config.WHATSAPP_RAW_NUMBER || '923156251281'}?text=Hi%20Organiva,%20I%20have%20a%20question%20regarding%20my%20order%20${order.orderId}" target="_blank" style="display: inline-block; margin-top: 8px; font-weight: 800; color: #185A2B; text-decoration: underline;">
                ${config.WHATSAPP_NUMBER || '+92 315 6251281'} (WhatsApp Support)
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #FAF8F5; padding: 26px 36px; text-align: center; border-top: 1px solid #EBF1EB; font-size: 12px; color: #7F8681; line-height: 1.6;">
            <strong>Organiva Pakistan</strong> &bull; Smart Products, Simpler Living.<br/>
            Lahore, Pakistan &bull; Dedicated to quality & fast nationwide fulfillment.<br/>
            &copy; ${new Date().getFullYear()} Organiva. All rights reserved.
          </td>
        </tr>

      </table>
    </body>
    </html>
    `;
  }

  /**
   * Sends the transactional order confirmation email to the customer
   */
  public static async sendCustomerOrderConfirmation(order: IOrder): Promise<boolean> {
    const customerEmail = order.customer.email;
    if (!customerEmail || !customerEmail.includes('@')) {
      console.log(`[EmailService] Notice: No customer email provided for order ${order.orderId}, skipping email dispatch.`);
      return false;
    }

    const html = this.generateOrderEmailHtml(order);

    // If SMTP credentials exist, send via transporter
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = this.getTransporter();
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Organiva Pakistan" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: `Order Confirmed: ${order.orderId} - Organiva Pakistan`,
          html,
        });
        console.log(`[EmailService] Customer order confirmation email dispatched to ${customerEmail} for order ${order.orderId}`);
        return true;
      } catch (err: any) {
        console.error(`[EmailService] SMTP send error for ${customerEmail}:`, err.message);
        return false;
      }
    } else {
      console.log(`[EmailService] [Simulation] SMTP credentials pending in .env. Beautiful email generated for ${customerEmail} (Order #${order.orderId}, Total: PKR ${order.total}).`);
      return true;
    }
  }

  /**
   * Sends purchase alert to the store owner
   */
  public static async sendStoreOwnerPurchaseAlert(order: IOrder): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'nawaznoman7766@gmail.com';
    const itemsList = order.items.map((i) => `- ${i.title} (x${i.quantity})`).join('\n');
    const msg = `🚨 New Purchase Alert!\nOrder: ${order.orderId}\nCustomer: ${order.customer.fullName} (${order.customer.phone})\nCity: ${order.customer.city}\nAmount: PKR ${order.total} (${order.paymentMethod})\nItems:\n${itemsList}\nCMS: ${config.CLIENT_URL}/admin/orders`;

    console.log(`[Owner Alert] New order placed:\n${msg}`);

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = this.getTransporter();
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Organiva Storefront" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `🚨 New Order: ${order.orderId} - PKR ${order.total}`,
          text: msg,
        });
      } catch (err) {
        // Log silently
      }
    }
  }

  /**
   * Send an immediate test email to verify credentials
   */
  public static async sendTestEmail(recipientEmail: string): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log(`[EmailService] SMTP server connection verified successfully.`);

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Organiva Pakistan" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `🌿 Test Email from Organiva Pakistan - SMTP Connected!`,
        html: `
        <div style="font-family: Arial, sans-serif; background: #FAF8F5; padding: 24px; color: #2E332F;">
          <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2ECE3; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
            <div style="background: #172319; padding: 24px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 22px; letter-spacing: 1.5px;">ORGANIVA PAKISTAN</h2>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #8EB892; text-transform: uppercase;">Smart Products &bull; Simpler Living</p>
            </div>
            <div style="padding: 28px;">
              <div style="display: inline-block; background-color: #E8F8EE; color: #1B7032; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px;">
                ✓ SMTP Verification Successful
              </div>
              <h3 style="margin: 0 0 12px 0; color: #171A18;">Email System Online!</h3>
              <p style="line-height: 1.6; color: #525B54; font-size: 14px;">
                Assalam-o-alaikum,<br/><br/>
                This is a confirmation that your SMTP configuration for <strong>${process.env.SMTP_USER}</strong> is working properly. All future customer orders will now receive high-quality branded confirmation emails directly into their inbox.
              </p>
              <div style="background: #FAF8F5; border-radius: 12px; padding: 14px; margin: 20px 0; font-size: 12px; color: #435845;">
                <strong>Sender:</strong> ${process.env.SMTP_USER}<br/>
                <strong>Recipient:</strong> ${recipientEmail}<br/>
                <strong>Timestamp:</strong> ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
              </div>
            </div>
          </div>
        </div>
        `,
      });

      console.log(`[EmailService] Test email dispatched successfully to ${recipientEmail}. MessageId: ${info.messageId}`);
      return { success: true, message: 'Email sent successfully', messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EmailService] Failed to send test email:`, err.message);
      return { success: false, message: err.message };
    }
  }
}
