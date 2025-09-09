import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
      <Link to="/login" style={{ marginRight: '10px' }}>登入</Link>
      <Link to="/register">註冊</Link>
    </nav>
  );
};

export default Navbar;
