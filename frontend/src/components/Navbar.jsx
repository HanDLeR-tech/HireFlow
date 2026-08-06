import { Link, useLocation, useNavigate } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, LogOutIcon } from "lucide-react";
import useAuth from "../hooks/useAuth.js";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200">
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Hire Flow
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${
                isActive("/problems")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* DASHBORD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${
                isActive("/dashboard")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashbord</span>
            </div>
          </Link>

          <div className="ml-4">
            {user ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="cursor-pointer transition-transform hover:scale-105">
                  <div className="avatar placeholder">
                    <div className="w-11 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg flex items-center justify-center">
                      <span className="text-lg font-bold leading-none">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                </label>

                <div
                  tabIndex={0}
                  className="dropdown-content mt-4 w-72 rounded-3xl bg-base-100 border border-base-300 shadow-2xl overflow-hidden"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="avatar placeholder mb-4">
                      <div className="w-20 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg flex items-center justify-center">
                        <span className="text-3xl font-bold leading-none">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <h2 className="font-bold text-lg">{user.name}</h2>

                    <p className="text-sm text-base-content/60 break-all mt-1">{user.email}</p>
                  </div>

                  <div className="border-t border-base-300 p-3">
                    <button onClick={handleLogout} className="btn btn-error btn-outline w-full">
                      <LogOutIcon className="size-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
