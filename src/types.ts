export type EventType = 'partial_update' | 'final_turn';
export type SourceLanguage = 'bn' | 'hi' | 'en' | 'unknown';
export type SpeakerRole = 'CALLER' | 'OPERATOR';
export type SpeakerSource = 'backend' | 'inferred';
export type RiskPriority = 'low' | 'medium' | 'high' | 'critical';
export type LocationStatus = 'known' | 'unknown' | 'approximate';

export interface BackendEvent {
  event_type: EventType;
  call_id: string;
  source_language: SourceLanguage;
  speaker: {
    role: SpeakerRole;
    source: SpeakerSource;
  };
  timing: {
    start: number;
    end: number;
    display: string;
  };
  transcript: {
    original: string;
    english: string;
    is_final: boolean;
  };
  risk: {
    score: number;
    signals: string[];
    priority: RiskPriority;
  };
  guidance: {
    suggested_operator_reply: string;
    suggested_questions: string[];
    recommended_actions: string[];
  };
  state_summary: {
    incident_type: string;
    caller_status: string;
    location_status: LocationStatus;
    latest_situation: string;
  };
}
