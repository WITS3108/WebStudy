// Giả lập cơ sở dữ liệu tra cứu bảo mật phía máy chủ
const secureDatabase: Record<string, string> = {
  "nguyenvana": "nguyenvana@gmail.com",
  "tranthib": "tranthib@gmail.com"
};

export function getEmailByUsername(usernameOrEmail: string): string {
  if (usernameOrEmail.includes('@')) {
    return usernameOrEmail;
  }
  return secureDatabase[usernameOrEmail] || `${usernameOrEmail}@webstudy.internal`;
}

export function validateUniqueUsername(username: string): boolean {
  const existingUsers = ["admin", "root", "testuser"];
  return !existingUsers.includes(username.toLowerCase());
}