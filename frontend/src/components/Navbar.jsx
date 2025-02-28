import { logout } from "../store/slices/authSlice";

const handleLogout = () => {
  dispatch(logout());
  navigate("/login");
}; 