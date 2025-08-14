-- MegaPicks Database Schema for Supabase (PostgreSQL)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    handle VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leagues table
CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 20.00,
    weeks_count INT DEFAULT 18,
    season_year INT NOT NULL,
    created_by UUID REFERENCES public.users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons table
CREATE TABLE public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_count INT DEFAULT 18,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, year)
);

-- Contestants (users in a league/season)
CREATE TABLE public.contestants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    helmet_config JSONB DEFAULT '{"shell": "#fc440f", "facemask": "#ffffff", "stripe": "#000000", "decal": "lightning"}',
    is_paid BOOLEAN DEFAULT false,
    fake_money_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, season_id)
);

-- Games table (NFL games)
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espn_game_id VARCHAR(50) UNIQUE,
    season_year INT NOT NULL,
    week INT NOT NULL,
    game_type VARCHAR(20) DEFAULT 'regular', -- regular, playoff, etc
    home_team VARCHAR(5) NOT NULL,
    away_team VARCHAR(5) NOT NULL,
    kickoff_time TIMESTAMPTZ NOT NULL,
    
    -- Betting lines (snapshot at pick open)
    spread_open DECIMAL(3,1),
    total_open DECIMAL(4,1),
    home_ml_open INT,
    away_ml_open INT,
    
    -- Current lines
    spread_current DECIMAL(3,1),
    total_current DECIMAL(4,1),
    home_ml_current INT,
    away_ml_current INT,
    
    -- Live game data
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, final
    quarter VARCHAR(10),
    time_remaining VARCHAR(10),
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    possession VARCHAR(5),
    yard_line INT,
    down INT,
    distance INT,
    is_redzone BOOLEAN DEFAULT false,
    last_play TEXT,
    
    -- Results
    is_complete BOOLEAN DEFAULT false,
    winning_team VARCHAR(5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for games table
CREATE INDEX idx_games_week ON public.games(season_year, week);
CREATE INDEX idx_games_kickoff ON public.games(kickoff_time);

-- Picks table (ATS picks)
CREATE TABLE public.picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    week INT NOT NULL,
    pick VARCHAR(5) NOT NULL, -- team abbreviation
    spread_at_pick DECIMAL(3,1), -- snapshot of spread when picked
    
    -- Results
    result VARCHAR(10), -- win, loss, push, pending
    points_earned DECIMAL(2,1) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contestant_id, game_id)
);

-- Parlays table
CREATE TABLE public.parlays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    week INT NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    leg_count INT NOT NULL CHECK (leg_count >= 3),
    
    -- Results
    status VARCHAR(20) DEFAULT 'pending', -- pending, hit, busted
    points_earned INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contestant_id, season_id, week)
);

-- Parlay legs table
CREATE TABLE public.parlay_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parlay_id UUID REFERENCES public.parlays(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    pick VARCHAR(5) NOT NULL, -- team abbreviation
    ml_at_pick INT, -- moneyline odds when picked
    
    -- Results
    result VARCHAR(10), -- win, loss, pending
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parlay_id, game_id)
);

-- Week submissions tracking
CREATE TABLE public.week_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    week INT NOT NULL,
    
    -- Submission tracking
    submitted_at TIMESTAMPTZ,
    lock_time TIMESTAMPTZ NOT NULL,
    minutes_late INT DEFAULT 0,
    late_penalty DECIMAL(3,1) DEFAULT 0,
    
    -- Scoring
    ats_points DECIMAL(4,1) DEFAULT 0,
    parlay_points INT DEFAULT 0,
    total_points DECIMAL(4,1) DEFAULT 0,
    
    -- Status
    is_complete BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contestant_id, season_id, week)
);

-- Standings table
CREATE TABLE public.standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    
    -- ATS stats
    ats_wins INT DEFAULT 0,
    ats_losses INT DEFAULT 0,
    ats_pushes INT DEFAULT 0,
    ats_points DECIMAL(5,1) DEFAULT 0,
    
    -- Parlay stats
    parlays_hit INT DEFAULT 0,
    parlays_busted INT DEFAULT 0,
    parlay_points INT DEFAULT 0,
    
    -- Totals
    total_points DECIMAL(6,1) DEFAULT 0,
    rank INT,
    
    -- Weekly breakdown (JSON array of weekly points)
    weekly_points JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contestant_id, season_id)
);

-- Pots table
CREATE TABLE public.pots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    week INT,
    pot_type VARCHAR(20) NOT NULL, -- weekly, mega
    amount DECIMAL(10,2) DEFAULT 0,
    is_rolled_over BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_id, week, pot_type)
);

-- Payouts table
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    pot_id UUID REFERENCES public.pots(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payout_type VARCHAR(20) NOT NULL, -- weekly_winner, season_champion
    week INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- League notes/announcements
CREATE TABLE public.league_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trophy/achievements table
CREATE TABLE public.trophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
    trophy_type VARCHAR(50) NOT NULL, -- weekly_winner, perfect_card, parlay_king, etc
    week INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contestant_id, season_id, trophy_type, week)
);

-- Line snapshots (for tracking line movement)
CREATE TABLE public.line_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    spread DECIMAL(3,1),
    total DECIMAL(4,1),
    home_ml INT,
    away_ml INT,
    snapshot_type VARCHAR(20) NOT NULL, -- open, current, lock
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_picks_contestant_week ON public.picks(contestant_id, week);
CREATE INDEX idx_parlays_contestant_week ON public.parlays(contestant_id, week);
CREATE INDEX idx_standings_season ON public.standings(season_id, total_points DESC);
CREATE INDEX idx_week_submissions ON public.week_submissions(season_id, week);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parlays ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (expand as needed)
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "League members can view league" ON public.leagues FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.contestants 
        WHERE contestants.league_id = leagues.id 
        AND contestants.user_id = auth.uid()
    ));

CREATE POLICY "Contestants can view own picks" ON public.picks FOR SELECT 
    USING (contestant_id IN (
        SELECT id FROM public.contestants WHERE user_id = auth.uid()
    ));

CREATE POLICY "Contestants can insert own picks" ON public.picks FOR INSERT 
    WITH CHECK (contestant_id IN (
        SELECT id FROM public.contestants WHERE user_id = auth.uid()
    ));

-- Functions for game logic

-- Function to calculate weekly standings
CREATE OR REPLACE FUNCTION calculate_weekly_standings(p_season_id UUID, p_week INT)
RETURNS void AS $$
BEGIN
    -- Update week_submissions with calculated points
    UPDATE week_submissions ws
    SET 
        ats_points = (
            SELECT COALESCE(SUM(points_earned), 0)
            FROM picks p
            WHERE p.contestant_id = ws.contestant_id
            AND p.week = p_week
        ),
        parlay_points = (
            SELECT COALESCE(points_earned, 0)
            FROM parlays par
            WHERE par.contestant_id = ws.contestant_id
            AND par.week = p_week
        ),
        total_points = ats_points + parlay_points - late_penalty
    WHERE ws.season_id = p_season_id
    AND ws.week = p_week;
    
    -- Update season standings
    UPDATE standings s
    SET 
        ats_points = (
            SELECT COALESCE(SUM(ats_points), 0)
            FROM week_submissions
            WHERE contestant_id = s.contestant_id
            AND season_id = p_season_id
        ),
        parlay_points = (
            SELECT COALESCE(SUM(parlay_points), 0)
            FROM week_submissions
            WHERE contestant_id = s.contestant_id
            AND season_id = p_season_id
        ),
        total_points = ats_points + parlay_points
    WHERE s.season_id = p_season_id;
    
    -- Update rankings
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_points DESC) as new_rank
        FROM standings
        WHERE season_id = p_season_id
    )
    UPDATE standings
    SET rank = ranked.new_rank
    FROM ranked
    WHERE standings.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- Function to grade ATS picks
CREATE OR REPLACE FUNCTION grade_ats_pick(p_pick_id UUID)
RETURNS void AS $$
DECLARE
    v_game games%ROWTYPE;
    v_pick picks%ROWTYPE;
    v_spread DECIMAL(3,1);
    v_result VARCHAR(10);
    v_points DECIMAL(2,1);
BEGIN
    SELECT * INTO v_pick FROM picks WHERE id = p_pick_id;
    SELECT * INTO v_game FROM games WHERE id = v_pick.game_id;
    
    IF v_game.is_complete THEN
        v_spread := v_pick.spread_at_pick;
        
        -- Calculate ATS result
        IF v_pick.pick = v_game.home_team THEN
            -- Picked home team
            IF v_game.home_score + v_spread > v_game.away_score THEN
                v_result := 'win';
                v_points := 1.0;
            ELSIF v_game.home_score + v_spread = v_game.away_score THEN
                v_result := 'push';
                v_points := 0.5;
            ELSE
                v_result := 'loss';
                v_points := 0.0;
            END IF;
        ELSE
            -- Picked away team
            IF v_game.away_score + (-v_spread) > v_game.home_score THEN
                v_result := 'win';
                v_points := 1.0;
            ELSIF v_game.away_score + (-v_spread) = v_game.home_score THEN
                v_result := 'push';
                v_points := 0.5;
            ELSE
                v_result := 'loss';
                v_points := 0.0;
            END IF;
        END IF;
        
        UPDATE picks 
        SET result = v_result, points_earned = v_points
        WHERE id = p_pick_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contestants_updated_at BEFORE UPDATE ON public.contestants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
