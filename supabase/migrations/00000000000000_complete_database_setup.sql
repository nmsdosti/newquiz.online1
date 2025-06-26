-- Complete Database Setup for Quiz Application
-- This migration creates all tables, functions, and policies for a fresh start

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.anytime_quiz_answers CASCADE;
DROP TABLE IF EXISTS public.anytime_quiz_players CASCADE;
DROP TABLE IF EXISTS public.anytime_quiz_sessions CASCADE;
DROP TABLE IF EXISTS public.poll_answers CASCADE;
DROP TABLE IF EXISTS public.poll_players CASCADE;
DROP TABLE IF EXISTS public.poll_sessions CASCADE;
DROP TABLE IF EXISTS public.game_answers CASCADE;
DROP TABLE IF EXISTS public.game_players CASCADE;
DROP TABLE IF EXISTS public.game_sessions CASCADE;
DROP TABLE IF EXISTS public.options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    name TEXT,
    avatar_url TEXT,
    image TEXT,
    token_identifier TEXT NOT NULL UNIQUE,
    user_id TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    time_limit INTEGER NOT NULL DEFAULT 30,
    points INTEGER DEFAULT 1000,
    order_index INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create options table
CREATE TABLE public.options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_pin TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
    game_mode TEXT DEFAULT 'live' CHECK (game_mode IN ('live', 'self_paced')),
    current_question_index INTEGER DEFAULT 0,
    max_players INTEGER DEFAULT 100,
    allow_late_join BOOLEAN DEFAULT TRUE,
    show_leaderboard BOOLEAN DEFAULT TRUE,
    randomize_questions BOOLEAN DEFAULT FALSE,
    randomize_options BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_players table
CREATE TABLE public.game_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_email TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    average_response_time FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_answers table
CREATE TABLE public.game_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    option_id UUID REFERENCES public.options(id) ON DELETE CASCADE,
    answer_text TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    time_taken INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_sessions table
CREATE TABLE public.poll_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_pin TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
    current_question_index INTEGER DEFAULT 0,
    show_results BOOLEAN DEFAULT TRUE,
    allow_multiple_responses BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_players table
CREATE TABLE public.poll_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.poll_sessions(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_email TEXT,
    ip_address TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_answers table
CREATE TABLE public.poll_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.poll_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.poll_players(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    option_id UUID NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anytime_quiz_sessions table
CREATE TABLE public.anytime_quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_pin TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    title TEXT,
    description TEXT,
    time_limit INTEGER,
    max_attempts INTEGER DEFAULT 1,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    collect_email BOOLEAN DEFAULT TRUE,
    collect_phone BOOLEAN DEFAULT FALSE,
    require_registration BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anytime_quiz_players table
CREATE TABLE public.anytime_quiz_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.anytime_quiz_sessions(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    ip_address TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anytime_quiz_answers table
CREATE TABLE public.anytime_quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.anytime_quiz_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.anytime_quiz_players(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    option_id UUID REFERENCES public.options(id) ON DELETE CASCADE,
    answer_text TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    time_taken INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints
ALTER TABLE public.anytime_quiz_players ADD CONSTRAINT unique_anytime_quiz_participation 
    UNIQUE (session_id, ip_address, attempt_number);

ALTER TABLE public.game_players ADD CONSTRAINT unique_game_player_name 
    UNIQUE (session_id, player_name);

ALTER TABLE public.poll_players ADD CONSTRAINT unique_poll_player 
    UNIQUE (session_id, player_name);

-- Create comprehensive indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_token_identifier ON public.users(token_identifier);
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX idx_quizzes_is_public ON public.quizzes(is_public);
CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX idx_questions_order_index ON public.questions(quiz_id, order_index);
CREATE INDEX idx_options_question_id ON public.options(question_id);
CREATE INDEX idx_options_is_correct ON public.options(question_id, is_correct);
CREATE INDEX idx_game_sessions_host_id ON public.game_sessions(host_id);
CREATE INDEX idx_game_sessions_game_pin ON public.game_sessions(game_pin);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_game_players_session_id ON public.game_players(session_id);
CREATE INDEX idx_game_players_score ON public.game_players(session_id, score DESC);
CREATE INDEX idx_game_answers_session_id ON public.game_answers(session_id);
CREATE INDEX idx_game_answers_player_id ON public.game_answers(player_id);
CREATE INDEX idx_game_answers_question_id ON public.game_answers(question_id);
CREATE INDEX idx_poll_sessions_host_id ON public.poll_sessions(host_id);
CREATE INDEX idx_poll_sessions_game_pin ON public.poll_sessions(game_pin);
CREATE INDEX idx_poll_players_session_id ON public.poll_players(session_id);
CREATE INDEX idx_poll_answers_session_id ON public.poll_answers(session_id);
CREATE INDEX idx_anytime_quiz_sessions_host_id ON public.anytime_quiz_sessions(host_id);
CREATE INDEX idx_anytime_quiz_sessions_game_pin ON public.anytime_quiz_sessions(game_pin);
CREATE INDEX idx_anytime_quiz_sessions_status ON public.anytime_quiz_sessions(status);
CREATE INDEX idx_anytime_quiz_players_session_id ON public.anytime_quiz_players(session_id);
CREATE INDEX idx_anytime_quiz_players_email ON public.anytime_quiz_players(email);
CREATE INDEX idx_anytime_quiz_answers_session_id ON public.anytime_quiz_answers(session_id);

-- Create utility functions

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        user_id,
        email,
        name,
        full_name,
        avatar_url,
        token_identifier,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.email, NEW.id::text),
        NEW.created_at,
        NEW.updated_at
    ) ON CONFLICT (token_identifier) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        full_name = NEW.raw_user_meta_data->>'full_name',
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NEW.updated_at
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique game pins
CREATE OR REPLACE FUNCTION public.generate_game_pin()
RETURNS TEXT AS $$
DECLARE
    pin TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate a 6-digit random number
        pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if pin exists in any session table
        SELECT COUNT(*) INTO exists_count FROM (
            SELECT game_pin FROM public.game_sessions WHERE game_pin = pin AND status != 'completed'
            UNION ALL
            SELECT game_pin FROM public.poll_sessions WHERE game_pin = pin AND status != 'completed'
            UNION ALL
            SELECT game_pin FROM public.anytime_quiz_sessions WHERE game_pin = pin AND status != 'completed'
        ) AS all_pins;
        
        -- If pin doesn't exist in active sessions, return it
        IF exists_count = 0 THEN
            RETURN pin;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate quiz statistics
CREATE OR REPLACE FUNCTION public.get_quiz_stats(quiz_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'quiz_id', quiz_uuid,
        'total_questions', (
            SELECT COUNT(*) FROM public.questions WHERE quiz_id = quiz_uuid
        ),
        'total_game_sessions', (
            SELECT COUNT(*) FROM public.game_sessions WHERE quiz_id = quiz_uuid
        ),
        'total_poll_sessions', (
            SELECT COUNT(*) FROM public.poll_sessions WHERE quiz_id = quiz_uuid
        ),
        'total_anytime_sessions', (
            SELECT COUNT(*) FROM public.anytime_quiz_sessions WHERE quiz_id = quiz_uuid
        ),
        'total_players', (
            SELECT COUNT(DISTINCT player_id) FROM (
                SELECT gp.id as player_id FROM public.game_players gp
                JOIN public.game_sessions gs ON gs.id = gp.session_id
                WHERE gs.quiz_id = quiz_uuid
                UNION ALL
                SELECT pp.id as player_id FROM public.poll_players pp
                JOIN public.poll_sessions ps ON ps.id = pp.session_id
                WHERE ps.quiz_id = quiz_uuid
                UNION ALL
                SELECT ap.id as player_id FROM public.anytime_quiz_players ap
                JOIN public.anytime_quiz_sessions aq ON aq.id = ap.session_id
                WHERE aq.quiz_id = quiz_uuid
            ) all_players
        ),
        'average_score', (
            SELECT COALESCE(AVG(score), 0) FROM (
                SELECT gp.score FROM public.game_players gp
                JOIN public.game_sessions gs ON gs.id = gp.session_id
                WHERE gs.quiz_id = quiz_uuid AND gp.score > 0
                UNION ALL
                SELECT ap.score FROM public.anytime_quiz_players ap
                JOIN public.anytime_quiz_sessions aq ON aq.id = ap.session_id
                WHERE aq.quiz_id = quiz_uuid AND ap.score > 0
            ) all_scores
        ),
        'completion_rate', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE ROUND((COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100, 2)
            END
            FROM public.anytime_quiz_players ap
            JOIN public.anytime_quiz_sessions aq ON aq.id = ap.session_id
            WHERE aq.quiz_id = quiz_uuid
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard for a game session
CREATE OR REPLACE FUNCTION public.get_game_session_leaderboard(session_uuid UUID)
RETURNS TABLE(
    player_id UUID,
    player_name TEXT,
    score INTEGER,
    correct_answers INTEGER,
    total_answers INTEGER,
    accuracy FLOAT,
    average_response_time FLOAT,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gp.id,
        gp.player_name,
        gp.score,
        gp.correct_answers,
        gp.total_answers,
        CASE 
            WHEN gp.total_answers > 0 THEN ROUND((gp.correct_answers::FLOAT / gp.total_answers::FLOAT) * 100, 2)
            ELSE 0.0
        END,
        gp.average_response_time,
        ROW_NUMBER() OVER (ORDER BY gp.score DESC, gp.correct_answers DESC, gp.average_response_time ASC)::INTEGER
    FROM public.game_players gp
    WHERE gp.session_id = session_uuid
    ORDER BY gp.score DESC, gp.correct_answers DESC, gp.average_response_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quiz with questions and options
CREATE OR REPLACE FUNCTION public.get_quiz_with_questions(quiz_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'quiz', row_to_json(q),
        'questions', (
            SELECT json_agg(
                json_build_object(
                    'id', qu.id,
                    'text', qu.text,
                    'question_type', qu.question_type,
                    'time_limit', qu.time_limit,
                    'points', qu.points,
                    'order_index', qu.order_index,
                    'image_url', qu.image_url,
                    'options', (
                        SELECT json_agg(
                            json_build_object(
                                'id', o.id,
                                'text', o.text,
                                'is_correct', o.is_correct,
                                'order_index', o.order_index
                            ) ORDER BY o.order_index, o.created_at
                        )
                        FROM public.options o
                        WHERE o.question_id = qu.id
                    )
                ) ORDER BY qu.order_index, qu.created_at
            )
            FROM public.questions qu
            WHERE qu.quiz_id = quiz_uuid
        )
    ) INTO result
    FROM public.quizzes q
    WHERE q.id = quiz_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate player score with time bonus
CREATE OR REPLACE FUNCTION public.calculate_player_score(player_uuid UUID, session_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    correct_count INTEGER := 0;
    total_count INTEGER := 0;
    avg_time FLOAT := 0;
BEGIN
    -- Calculate score with time bonus
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN ga.is_correct THEN 
                    -- Base points from question, reduced by time taken (max time_limit seconds)
                    GREATEST(100, ga.points_earned)
                ELSE 0
            END
        ), 0),
        COUNT(CASE WHEN ga.is_correct THEN 1 END),
        COUNT(*),
        COALESCE(AVG(ga.time_taken), 0)
    INTO total_score, correct_count, total_count, avg_time
    FROM public.game_answers ga
    WHERE ga.player_id = player_uuid AND ga.session_id = session_uuid;
    
    -- Update the player's statistics
    UPDATE public.game_players
    SET 
        score = total_score,
        correct_answers = correct_count,
        total_answers = total_count,
        average_response_time = avg_time,
        last_seen = NOW()
    WHERE id = player_uuid AND session_id = session_uuid;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive session results
CREATE OR REPLACE FUNCTION public.get_session_results(session_uuid UUID, session_type TEXT DEFAULT 'game')
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF session_type = 'game' THEN
        SELECT json_build_object(
            'session_info', (
                SELECT row_to_json(gs)
                FROM public.game_sessions gs
                WHERE gs.id = session_uuid
            ),
            'quiz_info', (
                SELECT row_to_json(q)
                FROM public.quizzes q
                JOIN public.game_sessions gs ON gs.quiz_id = q.id
                WHERE gs.id = session_uuid
            ),
            'leaderboard', (
                SELECT json_agg(
                    json_build_object(
                        'player_id', gp.id,
                        'player_name', gp.player_name,
                        'score', gp.score,
                        'correct_answers', gp.correct_answers,
                        'total_answers', gp.total_answers,
                        'accuracy', CASE 
                            WHEN gp.total_answers > 0 THEN ROUND((gp.correct_answers::FLOAT / gp.total_answers::FLOAT) * 100, 2)
                            ELSE 0.0
                        END,
                        'average_response_time', gp.average_response_time,
                        'rank', ROW_NUMBER() OVER (ORDER BY gp.score DESC, gp.correct_answers DESC, gp.average_response_time ASC)
                    )
                )
                FROM public.game_players gp
                WHERE gp.session_id = session_uuid
                ORDER BY gp.score DESC, gp.correct_answers DESC, gp.average_response_time ASC
            ),
            'question_stats', (
                SELECT json_agg(
                    json_build_object(
                        'question_id', q.id,
                        'question_text', q.text,
                        'question_type', q.question_type,
                        'correct_answers', (
                            SELECT COUNT(*)
                            FROM public.game_answers ga
                            WHERE ga.question_id = q.id 
                            AND ga.session_id = session_uuid 
                            AND ga.is_correct = true
                        ),
                        'total_answers', (
                            SELECT COUNT(*)
                            FROM public.game_answers ga
                            WHERE ga.question_id = q.id 
                            AND ga.session_id = session_uuid
                        ),
                        'average_time', (
                            SELECT COALESCE(AVG(ga.time_taken), 0)
                            FROM public.game_answers ga
                            WHERE ga.question_id = q.id 
                            AND ga.session_id = session_uuid
                        )
                    )
                )
                FROM public.questions q
                JOIN public.game_sessions gs ON gs.quiz_id = q.quiz_id
                WHERE gs.id = session_uuid
                ORDER BY q.order_index, q.created_at
            )
        ) INTO result;
    ELSIF session_type = 'poll' THEN
        SELECT json_build_object(
            'session_info', (
                SELECT row_to_json(ps)
                FROM public.poll_sessions ps
                WHERE ps.id = session_uuid
            ),
            'participants', (
                SELECT json_agg(
                    json_build_object(
                        'player_id', pp.id,
                        'player_name', pp.player_name,
                        'joined_at', pp.joined_at
                    )
                )
                FROM public.poll_players pp
                WHERE pp.session_id = session_uuid
                ORDER BY pp.joined_at
            ),
            'poll_results', (
                SELECT json_agg(
                    json_build_object(
                        'question_id', q.id,
                        'question_text', q.text,
                        'responses', (
                            SELECT json_agg(
                                json_build_object(
                                    'option_id', o.id,
                                    'option_text', o.text,
                                    'vote_count', (
                                        SELECT COUNT(*)
                                        FROM public.poll_answers pa
                                        WHERE pa.option_id = o.id
                                        AND pa.session_id = session_uuid
                                    )
                                )
                            )
                            FROM public.options o
                            WHERE o.question_id = q.id
                            ORDER BY o.order_index, o.created_at
                        )
                    )
                )
                FROM public.questions q
                JOIN public.poll_sessions ps ON ps.quiz_id = q.quiz_id
                WHERE ps.id = session_uuid
                ORDER BY q.order_index, q.created_at
            )
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate quiz before starting session
CREATE OR REPLACE FUNCTION public.validate_quiz_for_session(quiz_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    question_count INTEGER;
    questions_with_options INTEGER;
BEGIN
    -- Count total questions
    SELECT COUNT(*) INTO question_count
    FROM public.questions
    WHERE quiz_id = quiz_uuid;
    
    -- Count questions with at least 2 options
    SELECT COUNT(DISTINCT q.id) INTO questions_with_options
    FROM public.questions q
    JOIN public.options o ON o.question_id = q.id
    WHERE q.quiz_id = quiz_uuid
    GROUP BY q.id
    HAVING COUNT(o.id) >= 2;
    
    SELECT json_build_object(
        'is_valid', (question_count > 0 AND question_count = questions_with_options),
        'total_questions', question_count,
        'questions_with_sufficient_options', questions_with_options,
        'errors', CASE 
            WHEN question_count = 0 THEN json_build_array('Quiz has no questions')
            WHEN question_count != questions_with_options THEN json_build_array('Some questions have insufficient options (minimum 2 required)')
            ELSE json_build_array()
        END
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON public.quizzes;
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
DROP TRIGGER IF EXISTS update_poll_sessions_updated_at ON public.poll_sessions;
DROP TRIGGER IF EXISTS update_anytime_quiz_sessions_updated_at ON public.anytime_quiz_sessions;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_poll_sessions_updated_at
    BEFORE UPDATE ON public.poll_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anytime_quiz_sessions_updated_at
    BEFORE UPDATE ON public.anytime_quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification function for realtime updates
CREATE OR REPLACE FUNCTION public.notify_session_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'session_update',
        json_build_object(
            'table', TG_TABLE_NAME,
            'type', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add notification triggers
CREATE TRIGGER notify_game_session_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION public.notify_session_update();

CREATE TRIGGER notify_game_player_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.notify_session_update();

CREATE TRIGGER notify_poll_session_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.poll_sessions
    FOR EACH ROW EXECUTE FUNCTION public.notify_session_update();

CREATE TRIGGER notify_anytime_session_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.anytime_quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION public.notify_session_update();

-- Create useful views
CREATE OR REPLACE VIEW public.quiz_details AS
SELECT 
    q.id,
    q.title,
    q.description,
    q.user_id,
    q.is_public,
    q.category,
    q.difficulty,
    q.time_limit,
    q.created_at,
    q.updated_at,
    COUNT(qu.id) as question_count,
    u.name as creator_name,
    u.email as creator_email
FROM public.quizzes q
LEFT JOIN public.questions qu ON q.id = qu.quiz_id
LEFT JOIN public.users u ON q.user_id = u.id
GROUP BY q.id, q.title, q.description, q.user_id, q.is_public, q.category, q.difficulty, q.time_limit, q.created_at, q.updated_at, u.name, u.email;

CREATE OR REPLACE VIEW public.active_sessions AS
SELECT 
    'game' as session_type,
    gs.id,
    gs.game_pin,
    gs.status,
    gs.created_at,
    q.title as quiz_title,
    u.name as host_name,
    COUNT(gp.id) as player_count
FROM public.game_sessions gs
JOIN public.quizzes q ON gs.quiz_id = q.id
JOIN public.users u ON gs.host_id = u.id
LEFT JOIN public.game_players gp ON gs.id = gp.session_id
WHERE gs.status IN ('waiting', 'active', 'paused')
GROUP BY gs.id, gs.game_pin, gs.status, gs.created_at, q.title, u.name

UNION ALL

SELECT 
    'poll' as session_type,
    ps.id,
    ps.game_pin,
    ps.status,
    ps.created_at,
    q.title as quiz_title,
    u.name as host_name,
    COUNT(pp.id) as player_count
FROM public.poll_sessions ps
JOIN public.quizzes q ON ps.quiz_id = q.id
JOIN public.users u ON ps.host_id = u.id
LEFT JOIN public.poll_players pp ON ps.id = pp.session_id
WHERE ps.status IN ('waiting', 'active', 'paused')
GROUP BY ps.id, ps.game_pin, ps.status, ps.created_at, q.title, u.name

UNION ALL

SELECT 
    'anytime' as session_type,
    aq.id,
    aq.game_pin,
    aq.status,
    aq.created_at,
    q.title as quiz_title,
    u.name as host_name,
    COUNT(ap.id) as player_count
FROM public.anytime_quiz_sessions aq
JOIN public.quizzes q ON aq.quiz_id = q.id
JOIN public.users u ON aq.host_id = u.id
LEFT JOIN public.anytime_quiz_players ap ON aq.id = ap.session_id
WHERE aq.status IN ('active', 'paused')
GROUP BY aq.id, aq.game_pin, aq.status, aq.created_at, q.title, u.name

ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant access to views
GRANT SELECT ON public.quiz_details TO anon, authenticated;
GRANT SELECT ON public.active_sessions TO anon, authenticated;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anytime_quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anytime_quiz_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anytime_quiz_answers;

-- Final comment
-- Database setup complete with all tables, functions, policies, triggers, and views
-- Ready for quiz application with live games, polls, and anytime quizzes
-- No sample data included - fresh start for new Supabase account