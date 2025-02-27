import { CurriculumStatus } from "./curriculum-status.model";

export interface Curriculum {
  id: string;
  name: string;
  career: string;
  experience: string;
  date: string;
  email: string;
  phone: string;
  location: string;
  languages: string;
  skills: string;
  availability: string;
  notes?: string; // Campo opcional
  pdfUrl: string;
  userId: string;
  status: CurriculumStatus; 
  showDetails?: boolean;
}