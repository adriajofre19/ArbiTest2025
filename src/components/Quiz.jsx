import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("/Questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(shuffle(data).slice(0, 25)));
  }, []);

  useEffect(() => {
    if (questions.length === 0 || showResults) return;

    const currentQuestion = questions[currentIndex];
    const isLong = currentQuestion.pregunta.length > 100;
    const timeForQuestion = isLong ? 45 : 30;

    setTotalTime(timeForQuestion * 1000); // milisegundos
    setElapsed(0);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 100 >= timeForQuestion * 1000) {
          handleNext();
          return 0;
        }
        return prev + 100;
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, questions, showResults]);

  const handleAnswer = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
    handleNext();
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const progressPercent = (elapsed / totalTime) * 100;
  const timeLeft = Math.ceil((totalTime - elapsed) / 1000);

  if (questions.length === 0)
    return <div className="text-center mt-10 text-lg">Cargando...</div>;

  if (showResults) {
    const correct = questions.filter(
      (q) => answers[q.id] === q.correcta
    ).length;

    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Has acertado {correct} de {questions.length} preguntas
        </h1>

        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent className="p-6 space-y-3">
              <div className="text-lg font-semibold">
                {idx + 1}. {q.pregunta}
              </div>

              {["a", "b", "c", "d"].map((opt) => {
                const isCorrect = q.correcta === opt;
                const isSelected = answers[q.id] === opt;

                const baseStyle =
                  "w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm font-medium";

                const resultStyle = isCorrect
                  ? "border-green-600 bg-green-100 text-green-800"
                  : isSelected
                  ? "border-red-500 bg-red-100 text-red-700"
                  : "border-neutral-300 bg-neutral-50";

                return (
                  <div
                    key={opt}
                    className={cn(baseStyle, resultStyle, "flex justify-between items-center")}
                  >
                    <span>{q[`respuesta_${opt}`]}</span>
                    {isCorrect && <span>✔️</span>}
                    {isSelected && !isCorrect && <span>❌</span>}
                  </div>
                );
              })}

              <div
                className={cn(
                  "pt-2 text-sm font-medium",
                  answers[q.id] === q.correcta
                    ? "text-green-700"
                    : "text-red-700"
                )}
              >
                {answers[q.id] === q.correcta
                  ? "¡Correcto!"
                  : `Incorrecto. Respuesta correcta: ${q.correcta})`}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="text-center pt-6">
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Pregunta {currentIndex + 1} de {questions.length}
      </h1>

      <Progress value={progressPercent} className="h-3 rounded-full transition-all duration-100" />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-xl font-semibold border-b pb-2">
            {currentQuestion.pregunta}
          </div>
          <div className="grid gap-3">
            {["a", "b", "c", "d"].map((opt) => {
              const selected = answers[currentQuestion.id] === opt;

              const baseStyle =
                "w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm font-medium";

              const selectedStyle = selected
                ? "border-blue-500 bg-blue-100 hover:bg-blue-200"
                : "border-neutral-300 hover:bg-neutral-100";

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswer(currentQuestion.id, opt)}
                  className={cn(baseStyle, selectedStyle)}
                >
                  {currentQuestion[`respuesta_${opt}`]}
                </button>
              );
            })}
          </div>
          <div className="text-sm text-gray-500 pt-2">
            Tiempo restante: {timeLeft}s
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
