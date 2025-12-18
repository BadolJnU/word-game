import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-indigo-600">WordMaster AI</h1>
      <div className="flex gap-4 items-center">
        <span className="text-gray-600">{auth.currentUser?.email}</span>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}