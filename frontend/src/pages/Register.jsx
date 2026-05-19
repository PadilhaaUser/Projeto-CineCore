import { Link } from 'react-router-dom';

function Register() {
  return (
    <div style={{ paddingTop: '80px', padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Cadastrar</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Nome" style={{ padding: '10px' }} />
        <input type="email" placeholder="Email" style={{ padding: '10px' }} />
        <input type="password" placeholder="Senha" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: 'var(--accent-primary)', color: 'white' }}>Criar Conta</button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        Já tem uma conta? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Faça login</Link>
      </div>
    </div>
  );
}
export default Register;
