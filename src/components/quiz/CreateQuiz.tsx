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
    console.log("\n=== VALIDATING QUIZ ===");

    if (!quizTitle.trim()) {
      console.log("Validation failed: Missing title");
      toast({
        title: "Missing title",
        description: "Please add a title for your quiz",
        variant: "destructive",
      });
      return false;
    }
    console.log("✓ Title validation passed");

    if (questions.length === 0) {
      console.log("Validation failed: No questions");
      toast({
        title: "No questions",
        description: "Your quiz must have at least one question",
        variant: "destructive",
      });
      return false;
    }
    console.log(
      `✓ Questions count validation passed (${questions.length} questions)`,
    );

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionNumber = i + 1;

      console.log(`\nValidating Question ${questionNumber}:`);
      console.log(
        `  Text: "${question.text.substring(0, 100)}${question.text.length > 100 ? "..." : ""}"`,
      );
      console.log(`  Full Text: "${question.text}"`);
      console.log(`  Text Length: ${question.text.length}`);
      console.log(`  Time Limit: ${question.timeLimit}`);

      // Log character codes for debugging
      console.log(
        `  Character codes:`,
        question.text.split("").map((char) => char.charCodeAt(0)),
      );

      // Check for invisible/hidden characters
      const invisibleChars = question.text.match(/[\u200B-\u200D\uFEFF]/g);
      if (invisibleChars) {
        console.log(`  Found invisible characters:`, invisibleChars);
      }

      // Check for Unicode normalization issues
      const normalizedText = question.text.normalize("NFC");
      if (normalizedText !== question.text) {
        console.log(`  Text normalization difference detected`);
        console.log(
          `  Original length: ${question.text.length}, Normalized length: ${normalizedText.length}`,
        );
      }

      if (!question.text.trim()) {
        console.log(
          `Validation failed: Question ${questionNumber} is missing text`,
        );
        toast({
          title: "Incomplete question",
          description: `Question ${questionNumber} is missing text`,
          variant: "destructive",
        });
        return false;
      }

      // Check for extremely long text that might cause database issues
      if (question.text.length > 10000) {
        console.log(
          `Validation failed: Question ${questionNumber} text is too long (${question.text.length} characters)`,
        );
        toast({
          title: "Question text too long",
          description: `Question ${questionNumber} text is too long (${question.text.length} characters, max 10000)`,
          variant: "destructive",
        });
        return false;
      }

      // Enhanced character validation
      const hasProblematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(
        question.text,
      );
      if (hasProblematicChars) {
        console.log(
          `Validation failed: Question ${questionNumber} contains problematic control characters`,
        );
        const problematicMatches = question.text.match(
          /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
        );
        console.log(`  Problematic characters found:`, problematicMatches);
        toast({
          title: "Invalid characters",
          description: `Question ${questionNumber} contains invalid control characters`,
          variant: "destructive",
        });
        return false;
      }

      // Check for other potentially problematic characters
      const hasUnicodeIssues = /[\uFFFD\uFEFF]/.test(question.text);
      if (hasUnicodeIssues) {
        console.log(
          `Validation failed: Question ${questionNumber} contains Unicode replacement or BOM characters`,
        );
        toast({
          title: "Invalid Unicode characters",
          description: `Question ${questionNumber} contains invalid Unicode characters`,
          variant: "destructive",
        });
        return false;
      }

      if (question.timeLimit < 5 || question.timeLimit > 120) {
        console.log(
          `Validation failed: Question ${questionNumber} has invalid time limit (${question.timeLimit})`,
        );
        toast({
          title: "Invalid time limit",
          description: `Time limit for question ${questionNumber} must be between 5 and 120 seconds`,
          variant: "destructive",
        });
        return false;
      }

      const hasCorrectOption = question.options.some((o) => o.isCorrect);
      if (!hasCorrectOption) {
        console.log(
          `Validation failed: Question ${questionNumber} doesn't have a correct answer`,
        );
        toast({
          title: "Missing correct answer",
          description: `Question ${questionNumber} doesn't have a correct answer selected`,
          variant: "destructive",
        });
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        console.log(
          `    Option ${j + 1}: "${option.text.substring(0, 50)}${option.text.length > 50 ? "..." : ""}" (Length: ${option.text.length}, Correct: ${option.isCorrect})`,
        );
        console.log(`    Full Option ${j + 1} Text: "${option.text}"`);

        if (!option.text.trim()) {
          console.log(
            `Validation failed: Question ${questionNumber}, Option ${j + 1} is empty`,
          );
          toast({
            title: "Incomplete option",
            description: `An option in question ${questionNumber} is empty`,
            variant: "destructive",
          });
          return false;
        }

        // Check option text length
        if (option.text.length > 5000) {
          console.log(
            `Validation failed: Question ${questionNumber}, Option ${j + 1} text is too long (${option.text.length} characters)`,
          );
          toast({
            title: "Option text too long",
            description: `Option ${j + 1} in question ${questionNumber} is too long (${option.text.length} characters, max 5000)`,
            variant: "destructive",
          });
          return false;
        }

        // Check for problematic characters in options
        const hasProblematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(
          option.text,
        );
        if (hasProblematicChars) {
          console.log(
            `Validation failed: Question ${questionNumber}, Option ${j + 1} contains problematic characters`,
          );
          toast({
            title: "Invalid characters",
            description: `Option ${j + 1} in question ${questionNumber} contains invalid characters`,
            variant: "destructive",
          });
          return false;
        }
      }

      console.log(`✓ Question ${questionNumber} validation passed`);
    }

    console.log("✓ All validations passed");
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
      let quizIdToUse;

      console.log("=== STARTING QUIZ SAVE ===");
      console.log("Quiz Title:", quizTitle);
      console.log("Quiz Description:", quizDescription);
      console.log("Number of questions:", questions.length);
      console.log("User ID:", user?.id);
      console.log("Is Editing:", isEditing);
      console.log("Quiz ID:", quizId);

      // Log all questions and options before saving
      questions.forEach((question, index) => {
        console.log(`\n--- Question ${index + 1} ---`);
        console.log(`Text: "${question.text}"`);
        console.log(`Text Length: ${question.text.length}`);
        console.log(`Time Limit: ${question.timeLimit}`);
        console.log(`Options:`);
        question.options.forEach((option, optIndex) => {
          console.log(
            `  Option ${optIndex + 1}: "${option.text}" (Length: ${option.text.length}, Correct: ${option.isCorrect})`,
          );
        });
      });

      if (isEditing && quizId) {
        console.log("\n=== UPDATING EXISTING QUIZ ===");
        // Update existing quiz
        const { error: quizError } = await supabase
          .from("quizzes")
          .update({
            title: quizTitle.trim(),
            description: quizDescription.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", quizId);

        if (quizError) {
          console.error("Quiz update error:", quizError);
          throw quizError;
        }
        console.log("Quiz updated successfully");

        quizIdToUse = quizId;

        // Delete existing questions and options to replace with new ones
        console.log("Fetching existing questions...");
        const { data: existingQuestions, error: fetchError } = await supabase
          .from("questions")
          .select("id")
          .eq("quiz_id", quizId);

        if (fetchError) {
          console.error("Error fetching existing questions:", fetchError);
          throw fetchError;
        }

        console.log("Existing questions:", existingQuestions);

        // Delete all existing questions (cascade will delete options)
        if (existingQuestions && existingQuestions.length > 0) {
          console.log(
            `Deleting ${existingQuestions.length} existing questions...`,
          );
          const { error: deleteError } = await supabase
            .from("questions")
            .delete()
            .eq("quiz_id", quizId);

          if (deleteError) {
            console.error("Error deleting existing questions:", deleteError);
            throw deleteError;
          }
          console.log("Existing questions deleted successfully");
        }
      } else {
        console.log("\n=== CREATING NEW QUIZ ===");
        // Check if user is authenticated
        if (!user || !user.id) {
          throw new Error("You must be logged in to create a quiz");
        }

        // Insert new quiz
        const quizInsertData = {
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          user_id: user.id,
        };
        console.log("Inserting quiz with data:", quizInsertData);

        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .insert(quizInsertData)
          .select();

        if (quizError) {
          console.error("Quiz insert error:", quizError);
          throw quizError;
        }

        if (!quizData || quizData.length === 0) {
          throw new Error("Failed to create quiz");
        }

        quizIdToUse = quizData[0].id;
        console.log("Created quiz with ID:", quizIdToUse);
      }

      console.log("\n=== INSERTING QUESTIONS ===");
      // Insert all questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`\n--- Processing Question ${i + 1} ---`);
        console.log(`Raw question text: "${question.text}"`);
        console.log(`Question text length: ${question.text.length}`);
        console.log(
          `Question text char codes:`,
          question.text.split("").map((char) => char.charCodeAt(0)),
        );

        // Clean and validate question text with more detailed logging
        const cleanQuestionText = question.text.trim();
        console.log(`Cleaned question text: "${cleanQuestionText}"`);
        console.log(`Cleaned text length: ${cleanQuestionText.length}`);

        if (!cleanQuestionText) {
          console.error(
            `ERROR: Question ${i + 1} text is empty after trimming`,
          );
          console.error(`Original text was: "${question.text}"`);
          console.error(`Original text length: ${question.text.length}`);
          throw new Error(`Question ${i + 1} text is empty after trimming`);
        }

        if (cleanQuestionText.length > 10000) {
          console.error(
            `ERROR: Question ${i + 1} text is too long (${cleanQuestionText.length} characters, max 10000)`,
          );
          throw new Error(
            `Question ${i + 1} text is too long (${cleanQuestionText.length} characters, max 10000)`,
          );
        }

        // Additional text cleaning - remove any potential problematic characters
        const sanitizedText = cleanQuestionText
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
          .replace(/[\uFFFD\uFEFF]/g, "") // Remove Unicode replacement/BOM characters
          .normalize("NFC"); // Normalize Unicode

        console.log(`Sanitized question text: "${sanitizedText}"`);
        console.log(`Sanitized text length: ${sanitizedText.length}`);

        if (sanitizedText !== cleanQuestionText) {
          console.log(`Text was sanitized - removed problematic characters`);
        }

        const questionInsertData = {
          quiz_id: quizIdToUse,
          text: sanitizedText,
          time_limit: question.timeLimit,
        };

        console.log(`Inserting question ${i + 1} with data:`, {
          quiz_id: questionInsertData.quiz_id,
          text: `"${questionInsertData.text.substring(0, 100)}${questionInsertData.text.length > 100 ? "..." : ""}"`,
          textLength: questionInsertData.text.length,
          time_limit: questionInsertData.time_limit,
        });

        console.log(
          `Full question text being inserted: "${questionInsertData.text}"`,
        );

        let questionId;
        try {
          const { data: questionData, error: questionError } = await supabase
            .from("questions")
            .insert(questionInsertData)
            .select();

          if (questionError) {
            console.error("\n=== QUESTION INSERT ERROR ===");
            console.error(`Question ${i + 1} insert error:`, questionError);
            console.error("Error code:", questionError.code);
            console.error("Error message:", questionError.message);
            console.error("Error details:", questionError.details);
            console.error("Error hint:", questionError.hint);
            console.error("Failed question data:", questionInsertData);
            console.error(
              "Question text that failed:",
              JSON.stringify(questionInsertData.text),
            );
            throw new Error(
              `Failed to insert question ${i + 1}: ${questionError.message} (Code: ${questionError.code})`,
            );
          }

          if (!questionData || questionData.length === 0) {
            console.error(
              `ERROR: No data returned after inserting question ${i + 1}`,
            );
            throw new Error(
              `Failed to create question ${i + 1} - no data returned`,
            );
          }

          questionId = questionData[0].id;
          console.log(`✓ Created question ${i + 1} with ID:`, questionId);
        } catch (insertError: any) {
          console.error("\n=== QUESTION INSERT EXCEPTION ===");
          console.error(
            `Exception during question ${i + 1} insert:`,
            insertError,
          );
          console.error("Exception message:", insertError.message);
          console.error("Exception stack:", insertError.stack);
          console.error(
            "Question data that caused exception:",
            questionInsertData,
          );
          throw insertError;
        }

        console.log(`Inserting options for question ${i + 1}...`);
        // Insert all options for this question
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];

          // Clean and validate option text
          const cleanOptionText = option.text.trim();
          if (!cleanOptionText) {
            throw new Error(
              `Question ${i + 1}, Option ${j + 1} text is empty after trimming`,
            );
          }

          if (cleanOptionText.length > 5000) {
            throw new Error(
              `Question ${i + 1}, Option ${j + 1} text is too long (${cleanOptionText.length} characters, max 5000)`,
            );
          }

          const optionInsertData = {
            question_id: questionId,
            text: cleanOptionText,
            is_correct: option.isCorrect,
          };

          console.log(`  Inserting option ${j + 1}:`, {
            ...optionInsertData,
            text: `"${optionInsertData.text.substring(0, 50)}${optionInsertData.text.length > 50 ? "..." : ""}"`,
            textLength: optionInsertData.text.length,
          });

          const { error: optionError } = await supabase
            .from("options")
            .insert(optionInsertData);

          if (optionError) {
            console.error(`Option ${j + 1} insert error:`, optionError);
            console.error("Failed option data:", optionInsertData);
            throw new Error(
              `Failed to insert option ${j + 1} for question ${i + 1}: ${optionError.message}`,
            );
          }

          console.log(`  Option ${j + 1} inserted successfully`);
        }

        console.log(`All options for question ${i + 1} inserted successfully`);
      }

      console.log("\n=== QUIZ SAVE COMPLETED SUCCESSFULLY ===");
      toast({
        title: isEditing ? "Quiz updated!" : "Quiz created!",
        description: isEditing
          ? "Your quiz has been updated successfully"
          : "Your quiz has been saved successfully",
      });

      navigate("/host");
    } catch (error: any) {
      console.error("\n=== ERROR SAVING QUIZ ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Log current state for debugging
      console.error("Current quiz state:", {
        title: quizTitle,
        description: quizDescription,
        questionsCount: questions.length,
        userId: user?.id,
        isEditing,
        quizId,
      });

      toast({
        title: "Error saving quiz",
        description:
          error.message || "Something went wrong. Check console for details.",
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
            <Logo className="h-12 w-auto ml-16" />
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
                  <Input
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(question.id, "text", e.target.value)
                    }
                    placeholder="Enter your question"
                    className="w-full"
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
                            className="flex-1 bg-white/20 border-none text-white placeholder:text-white/60 focus:ring-white/50"
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
