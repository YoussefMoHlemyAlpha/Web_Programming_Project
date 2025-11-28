import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const location = useLocation();

  if (!user || ["/login", "/register"].includes(location.pathname)) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/menu" className="logo">
          Foodie<span className="dot">.</span>
        </Link>
        <div className="nav-links">
          <Link to="/menu" className="nav-link">
            Menu
          </Link>
          <Link to="/orders" className="nav-link">
            Orders
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
