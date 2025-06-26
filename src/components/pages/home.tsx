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
            src="https://i.postimg.cc/pXxdtDJz/quiz-online-logo.png"
            alt="Newquiz.online Logo"
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
              Newquiz.online
            </h1>
            <h2 className="text-2xl lg:text-4xl font-light text-white mb-8">
              Create, Share & Play Interactive Quizzes
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Transform learning into an engaging experience. Create interactive
              quizzes, host live sessions, and connect with participants
              worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to={user ? "/create" : "/signup"}
                className="w-full sm:w-auto"
              >
                <Button className="w-full rounded-full bg-white text-[#FF6952] hover:bg-gray-100 text-lg px-8 py-4 h-auto transition-colors shadow-lg">
                  🎯 Create Quiz
                </Button>
              </Link>

              <Link to="/join" className="w-full sm:w-auto">
                <Button className="w-full rounded-full bg-white text-[#FF6952] hover:bg-gray-100 text-lg px-8 py-4 h-auto transition-colors shadow-lg">
                  🚀 Join Quiz
                </Button>
              </Link>
            </div>

            {/* How it works section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                How it works:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <span className="text-white/90">
                    Sign up and create your first quiz
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <span className="text-white/90">
                    Share the quiz code with participants
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <span className="text-white/90">
                    Host live sessions and track results
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="lg:w-1/2 flex flex-col items-center space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="text-white font-semibold mb-2">Live Quizzes</h4>
                <p className="text-white/80 text-sm">
                  Real-time interactive quiz sessions
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h4 className="text-white font-semibold mb-2">
                  Instant Results
                </h4>
                <p className="text-white/80 text-sm">
                  Get immediate feedback and analytics
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="text-white font-semibold mb-2">Custom Design</h4>
                <p className="text-white/80 text-sm">
                  Personalize your quiz experience
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">🌐</div>
                <h4 className="text-white font-semibold mb-2">Global Access</h4>
                <p className="text-white/80 text-sm">
                  Join from anywhere in the world
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Start?
              </h3>
              <p className="text-white/80 mb-4">
                Join thousands of educators and learners worldwide
              </p>
              {!user && (
                <Link to="/signup">
                  <Button className="rounded-full bg-white text-[#FF6952] hover:bg-gray-100 px-6 py-2 transition-colors">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
