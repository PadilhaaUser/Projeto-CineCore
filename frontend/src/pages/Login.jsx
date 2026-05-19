function Login() {
  return (
    <div style={{ paddingTop: '80px', padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Entrar</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" style={{ padding: '10px' }} />
        <input type="password" placeholder="Senha" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: 'var(--accent-primary)', color: 'white' }}>Login</button>
      </form>
    </div>
  );
}
export default Login;
