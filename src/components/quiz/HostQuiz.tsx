import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Clock, Copy, ArrowRight } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../auth/VercelAuthProvider";
import { useToast } from "@/components/ui/use-toast";
import UserMenu from "@/components/ui/user-menu";
import Logo from "@/components/ui/logo";
import { Link } from "react-router-dom";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  question_count?: number;
}

const HostQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [gamePin, setGamePin] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<"live" | "poll" | "anytime">("live");
  const [showGameModeSelection, setShowGameModeSelection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (quizzesError) throw quizzesError;

      const quizzesWithQuestionCount = await Promise.all(
        (quizzesData || []).map(async (quiz) => {
          console.log("Original quiz.id from DB:", quiz.id); // <--- ADD THIS
          console.log("Length of original quiz.id:", quiz.id.length); // <--- ADD THIS
          // Try to force convert to string just in case, though it should be string
          console.log("quiz.id as string:", String(quiz.id)); // <--- ADD THIS

          const { count, error } = await supabase
            .from("questions")
            .select("*", { count: "exact" })
            .eq("quiz_id", quiz.id); // Use the original for DB query for now

          return {
            ...quiz,
            question_count: count || 0,
          };
        }),
      );
      setQuizzes(quizzesWithQuestionCount);
    } catch (error: any) {
      toast({
        title: "Error loading quizzes",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!selectedQuiz) {
      toast({
        title: "No quiz selected",
        description: "Please select a quiz to host",
        variant: "destructive",
      });
      return;
    }

    setShowGameModeSelection(true);
  };

  const startGameWithMode = async (mode: "live" | "poll" | "anytime") => {
    try {
      // Generate a random 6-digit game PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      if (mode === "live") {
        // Create a new live game session
        const { data, error } = await supabase
          .from("game_sessions")
          .insert({
            quiz_id: selectedQuiz,
            host_id: user?.id,
            game_pin: pin,
            status: "waiting",
            game_mode: "live",
          })
          .select();

        if (error) throw error;
        if (!data || data.length === 0)
          throw new Error("Failed to create game session");

        setGamePin(pin);
        navigate(`/game/${data[0].id}`);
      } else if (mode === "poll") {
        // Create a new poll session
        const { data, error } = await supabase
          .from("poll_sessions")
          .insert({
            quiz_id: selectedQuiz,
            host_id: user?.id,
            game_pin: pin,
            status: "waiting",
          })
          .select();

        if (error) {
          console.error("Poll session creation error:", error);
          throw error;
        }
        if (!data || data.length === 0)
          throw new Error("Failed to create poll session");

        console.log("Created poll session:", data[0]);
        setGamePin(pin);
        setGameMode("poll");
        // Don't navigate immediately, show the game PIN first
        // navigate(`/poll/${data[0].id}`);
      } else if (mode === "anytime") {
        // Create a new anytime quiz session
        const { data, error } = await supabase
          .from("anytime_quiz_sessions")
          .insert({
            quiz_id: selectedQuiz,
            host_id: user?.id,
            game_pin: pin,
            status: "active",
          })
          .select();

        if (error) {
          console.error("Anytime quiz session creation error:", error);
          throw error;
        }
        if (!data || data.length === 0)
          throw new Error("Failed to create anytime quiz session");

        console.log("Created anytime quiz session:", data[0]);
        setGamePin(pin);
        navigate(`/anytime-quiz/${data[0].id}`);
      }

      setShowGameModeSelection(false);
    } catch (error: any) {
      toast({
        title: "Error starting game",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const copyGamePin = () => {
    if (gamePin) {
      navigator.clipboard.writeText(gamePin);
      toast({
        title: "Game PIN copied",
        description: "Share this PIN with participants",
      });
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(quizId);

      // First delete all questions associated with the quiz
      const { error: questionsError } = await supabase
        .from("questions")
        .delete()
        .eq("quiz_id", quizId);

      if (questionsError) throw questionsError;

      // Then delete the quiz itself
      const { error: quizError } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (quizError) throw quizError;

      // Update the local state to remove the deleted quiz
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));

      // If the deleted quiz was selected, clear the selection
      if (selectedQuiz === quizId) {
        setSelectedQuiz(null);
      }

      toast({
        title: "Quiz deleted",
        description: "The quiz has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting quiz",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FF6952] pt-16 pb-12">
      <div className="w-full bg-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-50">
        <Link to="/">
          <Logo className="h-12 w-auto ml-16" />
        </Link>
        <UserMenu />
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Host a Quiz</h1>
          <div className="flex gap-2 text-white">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="gap-2"
            >
              Home
            </Button>
            <Button
              onClick={() => navigate("/results")}
              variant="outline"
              className="gap-2"
            >
              View All Results
            </Button>
            <Button
              onClick={() => navigate("/create")}
              className="bg-navy hover:bg-navy/90 gap-2"
            >
              Create New Quiz
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-navy animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-navy/20 animate-pulse" />
              </div>
            </div>
          </div>
        ) : gamePin ? (
          <Card className="bg-white shadow-sm border-gray-100 text-center p-8">
            <div className="max-w-md mx-auto">
              <div className="mb-6 bg-navy text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-2">Game PIN</h2>
                <div className="text-5xl font-bold tracking-wider mb-4">
                  {gamePin}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    onClick={copyGamePin}
                    variant="outline"
                    className="bg-white/20 border-white text-white hover:bg-white/30 gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy PIN
                  </Button>

                  <div className="flex flex-col items-center bg-white p-3 rounded-lg">
                    <div className="bg-white p-1 rounded-md mb-2">
                      {gamePin && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/join?pin=${gamePin}`)}`}
                          alt="QR Code"
                          className="w-24 h-24"
                        />
                      )}
                    </div>
                    <span className="text-xs text-gray-800 font-medium">
                      Scan to join
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg mb-6">
                Share this PIN with participants. They can join at{" "}
                <span className="font-bold">quizmaster.com</span> or through the
                app.
              </p>
              <div className="flex justify-center gap-4">
                {gameMode === "poll" && (
                  <Button
                    onClick={() => {
                      // For poll games, find the session by game PIN and start it
                      supabase
                        .from("poll_sessions")
                        .select("id")
                        .eq("game_pin", gamePin)
                        .single()
                        .then(({ data, error }) => {
                          if (error || !data) {
                            toast({
                              title: "Error",
                              description: "Could not find poll session",
                              variant: "destructive",
                            });
                          } else {
                            navigate(`/poll/${data.id}`);
                          }
                        });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 text-lg px-8 py-6 h-auto"
                  >
                    Start Poll
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={() => {
                    // Navigate based on the game mode that was selected
                    if (gameMode === "live") {
                      // For live games, find the session by game PIN
                      supabase
                        .from("game_sessions")
                        .select("id")
                        .eq("game_pin", gamePin)
                        .single()
                        .then(({ data, error }) => {
                          if (error || !data) {
                            toast({
                              title: "Error",
                              description: "Could not find game session",
                              variant: "destructive",
                            });
                          } else {
                            navigate(`/game/${data.id}`);
                          }
                        });
                    } else if (gameMode === "poll") {
                      // For poll games, find the session by game PIN
                      supabase
                        .from("poll_sessions")
                        .select("id")
                        .eq("game_pin", gamePin)
                        .single()
                        .then(({ data, error }) => {
                          if (error || !data) {
                            toast({
                              title: "Error",
                              description: "Could not find poll session",
                              variant: "destructive",
                            });
                          } else {
                            navigate(`/poll/${data.id}`);
                          }
                        });
                    } else if (gameMode === "anytime") {
                      // For anytime games, find the session by game PIN
                      supabase
                        .from("anytime_quiz_sessions")
                        .select("id")
                        .eq("game_pin", gamePin)
                        .single()
                        .then(({ data, error }) => {
                          if (error || !data) {
                            toast({
                              title: "Error",
                              description:
                                "Could not find anytime quiz session",
                              variant: "destructive",
                            });
                          } else {
                            navigate(`/anytime-quiz/${data.id}`);
                          }
                        });
                    }
                  }}
                  className="bg-navy hover:bg-navy/90 gap-2 text-lg px-8 py-6 h-auto"
                >
                  {gameMode === "poll"
                    ? "Go to Poll Lobby"
                    : "Continue to Lobby"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ) : quizzes.length === 0 ? (
          <Card className="bg-white shadow-sm border-gray-100 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4">No Quizzes Found</h2>
              <p className="text-gray-600 mb-6">
                You haven't created any quizzes yet. Create your first quiz to
                get started!
              </p>
              <Button
                onClick={() => navigate("/create")}
                className="bg-[#46178F] hover:bg-[#3b1277] gap-2 text-lg px-8 py-6 h-auto"
              >
                Create Your First Quiz
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`bg-white shadow-sm border-2 cursor-pointer transition-all ${selectedQuiz === quiz.id ? "border-[#46178F]" : "border-gray-100 hover:border-gray-300"}`}
                  onClick={() => setSelectedQuiz(quiz.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {quiz.description || "No description"}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{quiz.question_count} questions</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Ensure quiz.id is trimmed before navigation
                          navigate(`/edit/${quiz.id.trim()}`);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Edit Quiz
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(quiz.id);
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Delete Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={startGame}
                disabled={!selectedQuiz}
                className="bg-navy hover:bg-navy/90 gap-2 text-lg px-8 py-6 h-auto disabled:opacity-50"
              >
                <Play className="h-5 w-5" />
                Start Game
              </Button>
            </div>

            {/* Game Mode Selection Modal */}
            {showGameModeSelection && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="bg-white shadow-xl border-gray-100 p-8 max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    Select Game Mode
                  </h2>
                  <div className="space-y-4">
                    <Button
                      onClick={() => startGameWithMode("live")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white p-6 h-auto text-left"
                    >
                      <div>
                        <div className="font-bold text-lg mb-1">Live Quiz</div>
                        <div className="text-sm opacity-90">
                          Real-time quiz with timer and instant results
                        </div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => startGameWithMode("poll")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 h-auto text-left"
                    >
                      <div>
                        <div className="font-bold text-lg mb-1">Poll Mode</div>
                        <div className="text-sm opacity-90">
                          Collect feedback with live results, no time limit
                        </div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => startGameWithMode("anytime")}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white p-6 h-auto text-left"
                    >
                      <div>
                        <div className="font-bold text-lg mb-1">
                          Self-Paced Quiz
                        </div>
                        <div className="text-sm opacity-90">
                          Players can join anytime and complete at their own
                          pace
                        </div>
                      </div>
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowGameModeSelection(false)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Cancel
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HostQuiz;
