import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

const INTERVIEW_QUESTIONS = [
  'Ceritakan tentang proyek web terakhir yang kamu kembangkan dengan React dan tantangan teknis tersulit yang kamu selesaikan.',
  'Ceritakan bug tersulit saat mengelola state di proyek React yang pernah kamu buat, dan bagaimana kamu memperbaikinya?',
  'Bagaimana kamu mengoptimalkan performa rendering di React dan kapan sebaiknya menggunakan useMemo atau useCallback?',
  'Jelaskan bagaimana kamu merancang komunikasi data antar komponen (props drilling vs context/custom hooks) dalam arsitektur React!',
  'Bagaimana caramu menghadapi perbedaan pendapat teknis atau jadwal interview yang bentrok dalam pencarian kerja?',
];

export function InterviewTimer() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes (120 seconds)
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(120);
  };

  const handleNextQuestion = () => {
    setIsRunning(false);
    setTimeLeft(120);
    setQuestionIndex((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <section className="application-detail-section interview-prep-section" aria-labelledby="interview-prep-title">
      <div className="interview-prep-header">
        <h3 id="interview-prep-title">LATIHAN INTERVIEW</h3>
        <span className="interview-question-indicator">
          Soal {questionIndex + 1} / {INTERVIEW_QUESTIONS.length}
        </span>
      </div>

      <div className="interview-question-box">
        <p className="interview-question-text">
          &ldquo;{INTERVIEW_QUESTIONS[questionIndex]}&rdquo;
        </p>
      </div>

      <div className="interview-timer-controls">
        <div className={`interview-timer-display ${timeLeft < 30 ? 'is-warning' : ''}`}>
          {minutes}:{seconds}
        </div>
        <div className="interview-btn-group">
          <button
            type="button"
            className={`btn ${isRunning ? 'btn-ghost' : 'btn-primary'} interview-btn`}
            onClick={handleToggleTimer}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Jeda' : 'Mulai'}
          </button>
          <button
            type="button"
            className="btn btn-ghost interview-btn"
            onClick={handleResetTimer}
            title="Reset timer ke 02:00"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            className="btn btn-ghost interview-btn"
            onClick={handleNextQuestion}
            title="Lanjut ke soal berikutnya"
          >
            <SkipForward size={14} />
            Lanjut
          </button>
        </div>
      </div>
    </section>
  );
}
