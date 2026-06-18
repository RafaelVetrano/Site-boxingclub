// services/auth-service.js
(function () {
  const { KEYS, read, write, remove, uid, hashPassword, delay } = window.BC_Storage;

  async function register({ firstName, lastName, email, password }) {
    await delay(700);
    const users = read(KEYS.users, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Já existe uma conta com este email.');
    }
    const passwordHash = await hashPassword(password);
    const user = {
      id: uid('u'),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(KEYS.users, users);
    const session = { userId: user.id, ts: Date.now() };
    write(KEYS.session, session);
    return publicUser(user);
  }

  async function login({ email, password }) {
    await delay(600);
    const users = read(KEYS.users, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Email ou senha incorretos.');
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) throw new Error('Email ou senha incorretos.');
    write(KEYS.session, { userId: user.id, ts: Date.now() });
    return publicUser(user);
  }

  function logout() {
    remove(KEYS.session);
  }

  function currentUser() {
    const session = read(KEYS.session, null);
    if (!session) return null;
    const users = read(KEYS.users, []);
    const user = users.find(u => u.id === session.userId);
    return user ? publicUser(user) : null;
  }

  function publicUser(u) {
    return {
      id: u.id, firstName: u.firstName, lastName: u.lastName,
      email: u.email, createdAt: u.createdAt,
      initials: ((u.firstName[0] || '') + (u.lastName[0] || '')).toUpperCase(),
      fullName: `${u.firstName} ${u.lastName}`.trim(),
    };
  }

  function allUsers() {
    return read(KEYS.users, []).map(publicUser);
  }

  function deleteUser(id) {
    const users = read(KEYS.users, []).filter(u => u.id !== id);
    write(KEYS.users, users);
    // also nuke their plan
    const plans = read(KEYS.plans, {});
    delete plans[id];
    write(KEYS.plans, plans);
  }

  // ------- ADMIN -------
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'admin123';

  async function adminLogin({ username, password }) {
    await delay(500);
    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      throw new Error('Credenciais administrativas inválidas.');
    }
    write(KEYS.adminSession, { ts: Date.now() });
    return { username: ADMIN_USER };
  }

  function adminLogout() { remove(KEYS.adminSession); }
  function isAdmin() { return !!read(KEYS.adminSession, null); }

  window.BC_AuthService = {
    register, login, logout, currentUser, allUsers, deleteUser,
    adminLogin, adminLogout, isAdmin,
    ADMIN_HINT: { user: ADMIN_USER, pass: ADMIN_PASS },
  };
})();
