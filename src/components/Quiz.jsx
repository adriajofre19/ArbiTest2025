import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch("/Questions.json")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(shuffle(data).slice(0, 25));
      });
  }, []);

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  if (questions.length === 0)
    return <div className="text-center mt-10 text-lg">Cargando...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto space-y-6 py-10 px-4 "
    >
      <h1 className="text-3xl font-bold text-center mb-6">EXAMEN REGLAS DE JUEGO</h1>

      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardContent className="p-6 space-y-4">
            <div className="text-xl font-semibold border-b pb-2">
              {idx + 1}. {q.pregunta}
            </div>
            <div className="grid gap-3">
              {["a", "b", "c", "d"].map((opt) => {
                const selected = answers[q.id] === opt;
                const isCorrect = q.correcta === opt;
                const showFeedback = showResults && selected;

                const baseStyle =
                  "w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm font-medium";

                const selectedStyle = !showResults
                  ? selected
                    ? "border-blue-500 bg-blue-100 hover:bg-blue-200"
                    : "border-neutral-300 hover:bg-neutral-100"
                  : isCorrect
                  ? "border-green-600 bg-green-100 text-green-800"
                  : selected
                  ? "border-red-500 bg-red-100 text-red-700"
                  : "border-neutral-300 bg-neutral-50";

                return (
                  <button
                    type="button"
                    key={opt}
                    disabled={showResults}
                    onClick={() => handleChange(q.id, opt)}
                    className={cn(baseStyle, selectedStyle)}
                  >
                    {q[`respuesta_${opt}`]}
                    {showFeedback && (
                      <span className="ml-2">
                        {isCorrect ? "✔️" : "❌"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div
                className={cn(
                  "text-sm pt-2",
                  answers[q.id] === q.correcta
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {answers[q.id] === q.correcta
                  ? "¡Correcto!"
                  : `Incorrecto. Respuesta correcta: ${q.correcta})`}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-6">
        {!showResults ? (
          <Button
            type="submit"
            className="text-lg px-8 py-4 rounded-xl shadow-md"
          >
            📝 Corregir examen
          </Button>
        ) : (
          <div className="text-xl font-semibold">
            Has acertado{" "}
            {
              questions.filter((q) => answers[q.id] === q.correcta).length
            }{" "}
            de {questions.length} preguntas.
          </div>
        )}
      </div>
    </form>
  );
}
