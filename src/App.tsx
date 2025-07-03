import { Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import Dashboard from "./components/pages/dashboard";
import Profile from "./components/pages/profile";
import Settings from "./components/pages/settings";
import CreateQuiz from "./components/quiz/CreateQuiz";
import HostQuiz from "./components/quiz/HostQuiz";
import GameLobby from "./components/quiz/GameLobby";
import GamePlay from "./components/quiz/GamePlay";
import JoinGame from "./components/quiz/JoinGame";
import PlayerGame from "./components/quiz/PlayerGame";
import PollGamePlay from "./components/quiz/PollGamePlay";
import PollPlayerGame from "./components/quiz/PollPlayerGame";
import AnytimeQuizJoin from "./components/quiz/AnytimeQuizJoin";
import AnytimeQuizPlayerGame from "./components/quiz/AnytimeQuizPlayerGame";
import AnytimeQuizGamePlay from "./components/quiz/AnytimeQuizGamePlay";
import AdminApproval from "./components/admin/AdminApproval";
import { AuthProvider, useAuth } from "./components/auth/VercelAuthProvider";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen, LoadingSpinner } from "./components/ui/loading-spinner";
import { keepDatabaseActive } from "./utils/keepAlive";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isApproved } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center border border-skyblue/30">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-navy mb-4">
            Account Pending Approval
          </h2>
          <p className="text-navy/70 mb-6">
            Your account is currently under review. You will receive access once
            approved by an administrator.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-coral text-white px-6 py-2 rounded-full hover:bg-coral/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isSuperAdmin, isApproved } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." />;
  }

  if (!user || !isApproved || (!isAdmin && !isSuperAdmin)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  // For the tempo routes
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <>
      {tempoRoutes}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route
          path="/results"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* User Account Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        {/* Quiz Creator Routes */}
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:quizId"
          element={
            <PrivateRoute>
              <CreateQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/host"
          element={
            <PrivateRoute>
              <HostQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/game/:sessionId"
          element={
            <PrivateRoute>
              <GameLobby />
            </PrivateRoute>
          }
        />
        <Route
          path="/game/:sessionId/play"
          element={
            <PrivateRoute>
              <GamePlay />
            </PrivateRoute>
          }
        />

        {/* Player Routes */}
        <Route path="/join" element={<JoinGame />} />
        <Route path="/play/:sessionId/:playerId" element={<PlayerGame />} />

        {/* Poll Routes */}
        <Route
          path="/poll/:sessionId"
          element={
            <PrivateRoute>
              <PollGamePlay />
            </PrivateRoute>
          }
        />
        <Route
          path="/poll-play/:sessionId/:playerId"
          element={<PollPlayerGame />}
        />

        {/* Anytime Quiz Routes */}
        <Route
          path="/anytime-quiz/:sessionId"
          element={
            <PrivateRoute>
              <AnytimeQuizGamePlay />
            </PrivateRoute>
          }
        />
        <Route
          path="/anytime-quiz-join/:sessionId"
          element={<AnytimeQuizJoin />}
        />
        <Route
          path="/anytime-quiz-play/:sessionId/:playerId"
          element={<AnytimeQuizPlayerGame />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminApproval />
            </AdminRoute>
          }
        />

        {/* Add this before the catchall route for tempo */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
    </>
  );
}

function App() {
  // Initialize the keep-alive mechanism when the app starts
  useEffect(() => {
    const cleanup = keepDatabaseActive();
    return () => cleanup();
  }, []);

  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen text="Loading application..." />}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
