/**
 * List of email addresses with admin access.
 * Only users with these emails can access /admin routes.
 */
export const ADMIN_EMAILS: string[] = [
  "eaguiletalopez@gmail.com",
  "disenarepromocionales@gmail.com",
  "leones.56@hotmail.com",
  "pgpgzz1752006@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
