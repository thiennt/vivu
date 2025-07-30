-- Migration to create all game tables for Supabase database

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    str INTEGER DEFAULT 0,
    int INTEGER DEFAULT 0,
    con INTEGER DEFAULT 0,
    agi INTEGER DEFAULT 0,
    luk INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    atk INTEGER DEFAULT 0,
    def INTEGER DEFAULT 0,
    magic_atk INTEGER DEFAULT 0,
    magic_def INTEGER DEFAULT 0,
    res INTEGER DEFAULT 0,
    base_crit INTEGER DEFAULT 0,
    base_hit INTEGER DEFAULT 0,
    base_dodge INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    str_point INTEGER DEFAULT 0,
    int_point INTEGER DEFAULT 0,
    con_point INTEGER DEFAULT 0,
    agi_point INTEGER DEFAULT 0,
    luk_point INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    character1_id INTEGER NOT NULL,
    character2_id INTEGER NOT NULL,
    winner INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (character1_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (character2_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (winner) REFERENCES characters(id) ON DELETE SET NULL
);

-- Create battle_histories table
CREATE TABLE IF NOT EXISTS battle_histories (
    id SERIAL PRIMARY KEY,
    battle_id INTEGER NOT NULL,
    turn INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    targeted_character_id INTEGER NOT NULL,
    action_name VARCHAR(255) NOT NULL,
    is_missed BOOLEAN DEFAULT FALSE,
    damage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (targeted_character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Create equipments table
CREATE TABLE IF NOT EXISTS equipments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    hp INTEGER DEFAULT 0,
    atk INTEGER DEFAULT 0,
    def INTEGER DEFAULT 0,
    crit_rate INTEGER DEFAULT 0,
    crit_damage INTEGER DEFAULT 0,
    magic_atk INTEGER DEFAULT 0,
    magic_def INTEGER DEFAULT 0,
    hit_rate INTEGER DEFAULT 0,
    dodge_rate INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_username ON characters(username);
CREATE INDEX IF NOT EXISTS idx_battles_character1_id ON battles(character1_id);
CREATE INDEX IF NOT EXISTS idx_battles_character2_id ON battles(character2_id);
CREATE INDEX IF NOT EXISTS idx_battle_histories_battle_id ON battle_histories(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_histories_character_id ON battle_histories(character_id);
CREATE INDEX IF NOT EXISTS idx_equipments_type ON equipments(type);

-- Add comments for documentation
COMMENT ON TABLE characters IS 'Game characters with stats and progression';
COMMENT ON TABLE battles IS 'Battle records between characters';
COMMENT ON TABLE battle_histories IS 'Detailed turn-by-turn battle logs';
COMMENT ON TABLE equipments IS 'Equipment items that can enhance character stats';