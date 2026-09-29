export interface VocabWord {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  hanViet?: string;
  antonym?: string;
  usage?: string;
  related?: string[];
  similar?: string[];
  unit?: string;
  dataset?: string;
}
