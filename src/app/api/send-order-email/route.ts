import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface OrderItem {
  name: string;
  quantity: number;
  price: number | null;
  color?: string | null;
  sku?: string;
}

interface OrderEmailBody {
  items: OrderItem[];
  tecnica?: { label: string; price: number; pricePerPiece?: number; pieces?: number } | null;
  total: number;
  orderId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderEmailBody;
    const { items, tecnica, total, orderId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos" }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const notifyEmails = process.env.ORDER_NOTIFY_EMAILS;

    if (!gmailUser || !gmailPass || !notifyEmails) {
      console.error("Missing email config env vars");
      return NextResponse.json({ error: "Email config missing" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const orderNum = orderId ? orderId.slice(0, 8).toUpperCase() : Date.now().toString(36).toUpperCase();
    const date = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build items table rows
    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
            <strong>${item.name}</strong>
            ${item.color ? `<br><span style="color: #14C6C9; font-size: 12px;">Color: ${item.color}</span>` : ""}
            ${item.sku ? `<br><span style="color: #999; font-size: 12px;">SKU: ${item.sku}</span>` : ""}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">
            ${item.price != null ? `$${(item.price * item.quantity).toFixed(2)}` : "Consultar"}
          </td>
        </tr>`
      )
      .join("");

    const tecnicaRow = tecnica
      ? `<tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;" colspan="2">
            <strong>Personalización:</strong> ${tecnica.label}
            <br><span style="color: #999; font-size: 12px;">${tecnica.pieces || "?"} pzas × $${(tecnica.pricePerPiece || tecnica.price).toFixed(2)}/pza</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">
            $${tecnica.price.toFixed(2)}
          </td>
        </tr>`
      : "";

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #111; padding: 24px 30px; text-align: center;">
        <h1 style="color: #14C6C9; margin: 0; font-size: 22px; letter-spacing: 2px;">DISEÑARE PROMOCIONALES</h1>
        <p style="color: #999; margin: 6px 0 0; font-size: 13px;">Nuevo pedido recibido</p>
      </div>

      <div style="padding: 30px;">
        <div style="background: #f8f9fa; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #555;">
            <strong style="color: #111;">Pedido #${orderNum}</strong><br>
            ${date}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Producto</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Cant.</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${tecnicaRow}
          </tbody>
        </table>

        <div style="background: #14C6C9; border-radius: 10px; padding: 16px 20px; text-align: right;">
          <span style="color: rgba(255,255,255,0.8); font-size: 14px; margin-right: 12px;">Total:</span>
          <strong style="color: #fff; font-size: 22px;">$${total.toFixed(2)} MXN</strong>
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #999; text-align: center;">
          Este pedido ya fue pagado. Por favor apartar los productos lo antes posible.
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 16px 30px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 11px; color: #bbb;">
          Correo enviado automáticamente por Diseñare Promocionales
        </p>
      </div>
    </div>`;

    const recipients = notifyEmails.split(",").map((e) => e.trim());

    await transporter.sendMail({
      from: `"Diseñare Promocionales" <${gmailUser}>`,
      to: recipients.join(", "),
      subject: `Nuevo pedido #${orderNum} — Diseñare Promocionales`,
      html,
    });

    return NextResponse.json({ ok: true, orderNum });
  } catch (err) {
    console.error("Send order email error:", err);
    const message = err instanceof Error ? err.message : "Error al enviar email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
