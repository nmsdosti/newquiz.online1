import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Users, Copy, Clock } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../auth/VercelAuthProvider";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/ui/logo";

interface Player {
  id: string;
  name: string;
}

const GameLobby = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameSession, setGameSession] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchGameSession();
      subscribeToPlayers();
    }
  }, [sessionId]);

  const fetchGameSession = async () => {
    try {
      setLoading(true);

      // Get the game session
      const { data: sessionData, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Game session not found");

      // Check if the current user is the host
      if (sessionData.host_id !== user?.id) {
        toast({
          title: "Access denied",
          description: "You are not the host of this game",
          variant: "destructive",
        });
        navigate("/host");
        return;
      }

      setGameSession(sessionData);

      // Get the quiz details
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", sessionData.quiz_id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Get the players who have joined
      const { data: playersData, error: playersError } = await supabase
        .from("game_players")
        .select("*")
        .eq("session_id", sessionId);

      if (playersError) throw playersError;

      const formattedPlayers = (playersData || []).map((player) => ({
        id: player.id,
        name: player.player_name,
      }));

      setPlayers(formattedPlayers);
    } catch (error: any) {
      toast({
        title: "Error loading game",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      navigate("/host");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlayers = () => {
    const subscription = supabase
      .channel("game_players_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_players",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newPlayer = payload.new;
          setPlayers((current) => [
            ...current,
            {
              id: newPlayer.id,
              name: newPlayer.player_name,
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const copyGamePin = () => {
    if (gameSession?.game_pin) {
      navigator.clipboard.writeText(gameSession.game_pin);
      toast({
        title: "Game PIN copied",
        description: "Share this PIN with participants",
      });
    }
  };

  const startGame = async () => {
    try {
      // Update the game session status to active
      const { error } = await supabase
        .from("game_sessions")
        .update({ status: "active" })
        .eq("id", sessionId);

      if (error) throw error;

      // Navigate to the game screen
      navigate(`/game/${sessionId}/play`);
    } catch (error: any) {
      toast({
        title: "Error starting game",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FF6952] pt-16 flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-navy animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-navy/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FF6952] pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-16">
          <div className="w-full bg-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-50">
            <img
              src="https://fixturlaser.com/wp-content/uploads/2021/05/ACOEM-LOGO-WithoutBaseline-CMYK-Bicolor.png"
              alt="ACOEM Logo"
              className="h-12 w-auto ml-16"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Game Lobby</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-navy text-white px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span>Waiting for players</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-white shadow-sm border-gray-100 h-full">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">{quiz?.title}</h2>
                  <p className="text-gray-600 text-sm">{quiz?.description}</p>
                </div>

                <div className="mb-6 bg-navy text-white p-4 rounded-xl text-center">
                  <h3 className="text-lg font-bold mb-1">Game PIN</h3>
                  <div className="text-4xl font-bold tracking-wider mb-2">
                    {gameSession?.game_pin}
                  </div>
                  <Button
                    onClick={copyGamePin}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white text-white hover:bg-white/30 gap-1 mb-4"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>

                  <div className="flex justify-center">
                    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                      <div className="bg-white p-1 rounded-md mb-2">
                        {gameSession?.game_pin && (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/join?pin=${gameSession.game_pin}`)}`}
                            alt="QR Code"
                            className="w-40 h-40"
                          />
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">
                        Scan to join
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">
                      {players.length} Players
                    </span>
                  </div>
                </div>

                <Button
                  onClick={startGame}
                  className="w-full bg-navy hover:bg-navy/90 gap-2 py-6 h-auto"
                >
                  <Play className="h-5 w-5" />
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-white shadow-sm border-gray-100 h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Players
                </h2>

                {players.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">
                      Waiting for players to join...
                    </p>
                    <p className="text-sm text-gray-400">
                      Players can join at quizmaster.com using the game PIN
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-gray-50 rounded-xl p-3 text-center"
                      >
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-700 flex items-center justify-center border border-gray-100">
                          <span className="text-white text-xl font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 truncate">
                          {player.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
