import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const resend = new Resend(env.RESEND_API_KEY);

type TemplateName =
  | 'email-verification'
  | 'password-reset'
  | 'order-receipt'
  | 'subscription-activated'
  | 'subscription-cancelled';

const subjectMap: Record<TemplateName, string> = {
  'email-verification': 'Confirme seu cadastro no Boxing Club',
  'password-reset': 'Redefina sua senha do Boxing Club',
  'order-receipt': 'Pedido #{{number}} confirmado · Boxing Club',
  'subscription-activated': 'Sua assinatura está ativa · Boxing Club',
  'subscription-cancelled': 'Assinatura cancelada · Boxing Club',
};

const templateCache = new Map<string, string>();

function loadTemplate(name: TemplateName): string {
  if (templateCache.has(name)) return templateCache.get(name)!;
  const path = join(__dirname, 'templates', `${name}.html`);
  const content = readFileSync(path, 'utf-8');
  templateCache.set(name, content);
  return content;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    template
  );
}

export async function sendEmail(
  template: TemplateName,
  to: string,
  variables: Record<string, string>
): Promise<void> {
  try {
    if (!env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping email "${template}" to ${to}`);
      return;
    }

    const rawTemplate = loadTemplate(template);
    const html = interpolate(rawTemplate, variables);
    const rawSubject = subjectMap[template];
    const subject = interpolate(rawSubject, variables);

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[email] Resend error sending "${template}" to ${to}:`, error);
    } else {
      console.log(`[email] Sent "${template}" to ${to} — id: ${data?.id}`);
    }
  } catch (err) {
    console.error(`[email] Failed to send "${template}" to ${to}:`, err);
  }
}
