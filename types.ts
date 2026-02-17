
export enum Department {
  HOME_AFFAIRS = 'Home Affairs',
  HOMELAND_DEFENSE = 'Homeland & Defense',
  SOCIAL_AFFAIRS = 'Social Affairs',
  TREASURY_ECONOMIC = 'Treasury & Economic',
  HUMAN_RESOURCE = 'Human Resource',
  HEALTH = 'Health Services'
}

export type PawnCategory = 'PERTANIAN' | 'PERTAMBANGAN' | 'PERHIASAN' | 'ALKOHOL' | 'HUNTING' | 'RONGSOK';
export type PawnStatus = 'BLUE' | 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number';
  required: boolean;
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FormField[];
  webhookKey: string;
}

// === NEW PERMISSION TYPES ===
export interface PermissionConfig {
  id: string;
  title: string; // Misal: Izin Cuti, Resign, Sakit
  icon: string;
  color: string; // hex color code untuk embed discord
  webhookKey: string; // Key localStorage untuk webhook url
  requireDate: boolean; // Apakah butuh tanggal mulai/selesai?
  fields: FormField[]; // Custom questions for the permission
}
// =============================

// === NEW RECRUITMENT TYPES ===
export type QuestionType = 'SHORT' | 'PARAGRAPH' | 'CHOICE' | 'IMAGE';

export interface RecruitmentQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // Untuk pilihan ganda (dipisah koma)
  required: boolean;
  isBold: boolean;
  placeholder?: string;
}

export interface RecruitmentConfig {
  isOpen: boolean;
  title: string;
  description?: string; // New description field
  targetSheetName: string; // Nama Tab di Spreadsheet, misal: 'Batch 1'
  scriptUrl: string; // URL Google Apps Script Web App
  spreadsheetUrl?: string; // URL Link View Spreadsheet
  questions: RecruitmentQuestion[];
}
// =============================

export interface PawnItem {
  id: string;
  name: string;
  category: PawnCategory;
  basePrice: number;
  status: PawnStatus;
  stock: number;
}

export interface StaffMember {
  role: string;
  name: string;
  level: number;
}

export interface LeadershipMember {
  id: string;
  role: string;
  name: string;
  icon: string;
  color?: string;
}

export interface DeptInfo {
  id: string;
  name: Department;
  icon: string;
  shortDescription: string;
  longDescription: string;
  responsibilities: string[];
  vision: string;
  requirements: string[];
  imageUrl: string;
  structuralStaff: StaffMember[];
}

export interface LegislativeDocument {
  id: string;
  title: string;
  icon: string;
  desc: string;
  link: string;
}

export interface SalaryRecord {
  id: string;
  staffName: string;
  position: string;
  deptName: string;
  baseSalary: number;
  bonus: number;
  penaltyLevel: 'NONE' | 'SP1' | 'SP2' | 'SP3';
  notes: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  tag: string;
  imageUrl?: string;
}

// === NEW CAROUSEL TYPE ===
export interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}
// =========================

// Update Role untuk mendukung Super Admin (Presiden) dan Staff Biasa
export type AdminRole = 'SUPER_ADMIN' | 'NEWS_ADMIN' | 'PAWN_ADMIN' | 'PAWN_STAFF' | 'HR_ADMIN' | 'TREASURY_ADMIN' | 'DHA_ADMIN' | 'SECRETARY_ADMIN' | 'SECRETARY_OF_STATE' | 'STAFF' | 'NONE';

export interface AuthState {
  isAdmin: boolean;
  staffName: string | null;
  role: AdminRole;
  nip?: string; // Menyimpan ID/PIN Login sebagai NIP
}

export interface AttendanceLog {
  staffName: string;
  role: string;
  action: string;
  timestamp: string;
}
