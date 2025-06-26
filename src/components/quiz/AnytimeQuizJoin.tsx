import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import UserMenu from "@/components/ui/user-menu";
import Logo from "@/components/ui/logo";
import { Link } from "react-router-dom";

const AnytimeQuizJoin = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizSession, setQuizSession] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetchQuizSession();
    }
  }, [sessionId]);

  const fetchQuizSession = async () => {
    try {
      // Get the anytime quiz session
      const { data: sessionData, error: sessionError } = await supabase
        .from("anytime_quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Quiz session not found");

      setQuizSession(sessionData);

      // Get the quiz details
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", sessionData.quiz_id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);
    } catch (error: any) {
      toast({
        title: "Error loading quiz",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback IP if service is unavailable
      return "unknown";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get client IP address
      const ipAddress = await getClientIP();

      // Check if this IP has already participated
      const { data: existingPlayer, error: checkError } = await supabase
        .from("anytime_quiz_players")
        .select("*")
        .eq("session_id", sessionId)
        .eq("ip_address", ipAddress)
        .single();

      if (!checkError && existingPlayer) {
        toast({
          title: "Already participated",
          description: "You have already taken this quiz from this network",
          variant: "destructive",
        });
        return;
      }

      // Add the player to the anytime quiz
      const { data, error } = await supabase
        .from("anytime_quiz_players")
        .insert({
          session_id: sessionId,
          player_name: playerName,
          email: email,
          phone: phone || null,
          ip_address: ipAddress,
        })
        .select();

      if (error) throw error;

      // Navigate to the anytime quiz player screen
      navigate(`/anytime-quiz-play/${sessionId}/${data[0].id}`);
    } catch (error: any) {
      toast({
        title: "Error joining quiz",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7C3AED] to-[#7C3AED] text-white flex items-center justify-center p-4">
      <div className="w-full bg-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-50">
        <Link to="/">
          <Logo className="h-12 w-auto ml-16" />
        </Link>
        <UserMenu />
      </div>
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <div className="flex justify-center items-center mb-4 mt-4">
          <Logo className="bg-white/20 backdrop-blur-md p-1 rounded" />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white font-bold">
            Join Quiz
          </CardTitle>
          {quiz && <p className="text-white/80 text-lg">{quiz.title}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="playerName"
                className="block text-sm text-white font-medium"
              >
                Full Name *
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-purple-500 focus:border-purple-500 text-lg h-14"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm text-white font-medium"
              >
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-purple-500 focus:border-purple-500 text-lg h-14"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm text-white font-medium"
              >
                Phone Number (Optional)
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-purple-500 focus:border-purple-500 text-lg h-14"
              />
            </div>

            <div className="text-xs text-white/70 bg-white/10 p-3 rounded-lg">
              <p className="mb-1">
                • This quiz can only be taken once per network
              </p>
              <p className="mb-1">
                • Your IP address will be recorded to prevent multiple attempts
              </p>
              <p>• All fields marked with * are required</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-purple-700 hover:bg-white/90 text-lg py-6 h-auto gap-2"
              disabled={loading}
            >
              {loading ? "Joining..." : "Start Quiz"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnytimeQuizJoin;
