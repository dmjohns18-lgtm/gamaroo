import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type QuestionLog = {
  standard: string;
  correct: boolean;
  question_text?: string;
};

export type GameSessionInput = {
  game_id: string;
  student_id?: string;
  score: number;
  total_questions: number;
  correct_count: number;
  streak_max?: number;
  subject?: string;
  questions?: QuestionLog[];
};

export async function saveGameSession(input: GameSessionInput) {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        game: input.game_id,
        user_id: input.student_id ?? null,
        subject: input.subject ?? null,
        correct: input.correct_count,
        total: input.total_questions,
        points_earned: input.score,
        played_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    if (input.questions && input.questions.length > 0 && session?.id) {
      const rows = input.questions.map(q => ({
        session_id: session.id,
        user_id: input.student_id ?? null,
        game: input.game_id,
        standard: q.standard,
        correct: q.correct,
        question_text: q.question_text ?? null,
      }));
      await supabase.from('question_log').insert(rows);
    }

    return { success: true, session };
  } catch (err) {
    console.error('saveGameSession error:', err);
    return { success: false };
  }
}
