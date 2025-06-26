import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/VercelAuthProvider";
import UserMenu from "@/components/ui/user-menu";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FF6952] text-white flex flex-col">
      <div className="w-full bg-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-50">
        <Link to="/">
          <img
            src="https://fixturlaser.com/wp-content/uploads/2021/05/ACOEM-LOGO-WithoutBaseline-CMYK-Bicolor.png"
            alt="ACOEM Logo"
            className="h-12 w-auto ml-16"
          />
        </Link>
        <UserMenu />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl px-8">
          {/* Left Side: Text + Buttons */}
          <div className="text-left mb-8 lg:mb-0 lg:w-1/2">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-white">
              Acoem Engage
            </h1>
            <h2 className="text-2xl lg:text-4xl font-light text-white mb-8">
              Where Possibility Meets Learning
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? "/create" : "/signup"}
                className="w-full sm:w-auto"
              >
                <Button className="w-full rounded-full bg-white text-[#FF6952] hover:bg-gray-100 text-lg px-8 py-4 h-auto transition-colors">
                  Create Quiz
                </Button>
              </Link>

              <Link to="/join" className="w-full sm:w-auto">
                <Button className="w-full rounded-full bg-white text-[#FF6952] hover:bg-gray-100 text-lg px-8 py-4 h-auto transition-colors">
                  Join Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="lg:w-1/2 flex justify-center">
            <img
              src="https://i.postimg.cc/LsNmDNfb/19245711-6101073-removebg-preview.png"
              alt="Acoem Visual"
              className="w-full max-w-xl rounded-xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
