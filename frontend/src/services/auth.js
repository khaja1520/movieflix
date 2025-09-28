// auth.js
// Minimal mocked auth for demo purposes
 
const KEY = 'mf_user';
 
export function loginMock({ email, password }) {
  // very basic check; replace with API auth later
  const isAdmin = email === 'admin@demo.com' && password === 'admin123';
  const payload = { email, role: isAdmin ? 'admin' : 'user' };
  localStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}
 
export function logout() {
  localStorage.removeItem(KEY);
}
 
export function currentUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
 
export function isLoggedIn() {
  return !!currentUser();
}
 
export function isAdmin() {
  const u = currentUser();
  return !!u && u.role === 'admin';
}
 