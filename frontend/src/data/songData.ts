export interface Song {
    id: string;
    title: string;
    artist: string;
    language: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    lyrics?: string[]; // Optional in list view, present in practice
}

export interface NextLineResponse {
    song_id?: string;
    title?: string;
    artist?: string;
    next_lines: string[];
    matched_line?: string;
    found: boolean;
    confidence: number;
}

export interface ExplainResponse {
    explanation: string;
}
