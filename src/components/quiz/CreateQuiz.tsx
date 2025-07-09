import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Trash2, Save, ArrowRight } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../auth/VercelAuthProvider";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/ui/logo";
import { Link } from "react-router-dom";
import UserMenu from "@/components/ui/user-menu";

interface Question {
  id: string;
  text: string;
  timeLimit: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizId } = useParams<{ quizId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      timeLimit: 30,
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
    },
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `${questions.length + 1}`,
      text: "",
      timeLimit: 30,
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (
    questionId: string,
    field: string,
    value: string | number,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q,
      ),
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    field: string,
    value: string | boolean,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, [field]: value } : o,
              ),
            }
          : q,
      ),
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => ({
                ...o,
                isCorrect: o.id === optionId,
              })),
            }
          : q,
      ),
    );
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please add a title for your quiz",
        variant: "destructive",
      });
      return false;
    }

    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Your quiz must have at least one question",
        variant: "destructive",
      });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.text.trim()) {
        toast({
          title: "Incomplete question",
          description: `Question ${i + 1} is missing text`,
          variant: "destructive",
        });
        return false;
      }

      if (question.timeLimit < 5 || question.timeLimit > 120) {
        toast({
          title: "Invalid time limit",
          description: `Time limit for question ${i + 1} must be between 5 and 120 seconds`,
          variant: "destructive",
        });
        return false;
      }

      const hasCorrectOption = question.options.some((o) => o.isCorrect);
      if (!hasCorrectOption) {
        toast({
          title: "Missing correct answer",
          description: `Question ${i + 1} doesn't have a correct answer selected`,
          variant: "destructive",
        });
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.text.trim()) {
          toast({
            title: "Incomplete option",
            description: `Option ${j + 1} in question ${i + 1} is empty`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  // Load quiz data if editing an existing quiz
  useEffect(() => {
    if (quizId) {
      setIsEditing(true);
      loadQuizData(quizId);
    }
  }, [quizId]);

  const loadQuizData = async (id: string) => {
    try {
      setLoading(true);

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) throw quizError;
      if (!quizData) throw new Error("Quiz not found");

      // Set quiz title and description
      setQuizTitle(quizData.title);
      setQuizDescription(quizData.description || "");

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id);

      if (questionsError) throw questionsError;

      // For each question, fetch its options
      const loadedQuestions: Question[] = [];

      for (const question of questionsData || []) {
        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .eq("question_id", question.id);

        if (optionsError) throw optionsError;

        loadedQuestions.push({
          id: question.id,
          text: question.text,
          timeLimit: question.time_limit,
          options: optionsData.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.is_correct,
          })),
        });
      }

      if (loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
      }
    } catch (error: any) {
      console.error("Error loading quiz:", error);
      toast({
        title: "Error loading quiz",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user || !user.id) {
        throw new Error("You must be logged in to create a quiz");
      }

      console.log("Starting quiz creation...");
      console.log("Quiz title:", quizTitle);
      console.log("Number of questions:", questions.length);
      
      // Insert new quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          user_id: user.id,
        })
        .select();

      if (quizError) {
        console.error("Quiz insert error:", quizError);
        throw new Error(`Failed to create quiz: ${quizError.message}`);
      }

      if (!quizData || quizData.length === 0) {
        throw new Error("No quiz data returned from database");
      }

      const quizId = quizData[0].id;
      console.log("Created quiz with ID:", quizId);

      // Insert all questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`Processing question ${i + 1}:`, question.text.substring(0, 50) + "...");
        
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .insert({
            quiz_id: quizId,
            text: question.text.trim(),
            time_limit: question.timeLimit,
            order_index: i,
          })
          .select();

        if (questionError) {
          console.error("Question insert error:", questionError);
          throw new Error(`Failed to create question ${i + 1}: ${questionError.message}`);
        }

        if (!questionData || questionData.length === 0) {
          throw new Error(`No question data returned for question ${i + 1}`);
        }

        const questionId = questionData[0].id;
        console.log(`Created question ${i + 1} with ID:`, questionId);

        // Insert all options for this question
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          if (!option.text.trim()) {
            throw new Error(`Option ${j + 1} in question ${i + 1} is empty`);
          }
          
          const { error: optionError } = await supabase.from("options").insert({
            question_id: questionId,
            text: option.text.trim(),
            is_correct: option.isCorrect,
            order_index: j,
          });

          if (optionError) {
            console.error(`Option ${j + 1} insert error:`, optionError);
            throw new Error(`Failed to create option ${j + 1} for question ${i + 1}: ${optionError.message}`);
          }
        }
        
        console.log(`Successfully created all options for question ${i + 1}`);
      }

      console.log("Quiz creation completed successfully!");
      
      toast({
        title: "Quiz Created Successfully!",
        description: "Your quiz has been saved successfully",
      });

      navigate("/host");
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error saving quiz",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16 pb-12">
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-navy animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-navy/20 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4">
        <div className="w-full bg-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-50">
          <Link to="/">
            <img
              src="https://i.postimg.cc/HxN6vH35/Content-that.png"
              alt="ACOEM Logo"
              className="h-12 w-auto ml-16 hover:cursor-pointer"
            />
          </Link>
          <UserMenu />
        </div>
        <div className="flex justify-between items-center mb-6 mt-16">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/host")}
              className="gap-2"
            >
              Cancel
            </Button>
            <Button
              onClick={saveQuiz}
              className="bg-navy hover:bg-navy/90 gap-2"
            >
              <Save className="h-4 w-4" />
              Save Quiz
            </Button>
          </div>
        </div>

        <Card className="mb-8 bg-white shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <Input
                id="title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card
              key={question.id}
              className="bg-white shadow-sm border-gray-100"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                  disabled={questions.length === 1}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <Textarea
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(question.id, "text", e.target.value)
                    }
                    placeholder="Enter your question"
                    className="w-full min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (seconds)
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={question.timeLimit}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "timeLimit",
                        parseInt(e.target.value) || 30,
                      )
                    }
                    className="w-32"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => {
                      const colors = [
                        "bg-coral", // Coral
                        "bg-navy", // Navy
                        "bg-skyblue", // Sky Blue
                        "bg-coral/80", // Light Coral
                      ];
                      return (
                        <div
                          key={option.id}
                          className={`p-4 rounded-xl ${colors[index]} text-white flex items-center gap-3`}
                        >
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={option.isCorrect}
                            onChange={() =>
                              setCorrectOption(question.id, option.id)
                            }
                            className="h-4 w-4"
                          />
                          <Input
                            value={option.text}
                            onChange={(e) =>
                              updateOption(
                                question.id,
                                option.id,
                                "text",
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 bg-white/20 border-none text-white placeholder:text-white/60 focus:ring-white/50 min-h-[40px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addQuestion}
            variant="outline"
            className="w-full py-6 border-dashed border-2 flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <PlusCircle className="h-5 w-5" />
            Add Question
          </Button>

          <CardFooter className="flex justify-end pt-6">
            <Button
              onClick={saveQuiz}
              className="bg-navy hover:bg-navy/90 gap-2 text-lg px-8 py-6 h-auto"
            >
              Save Quiz
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
