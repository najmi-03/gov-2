
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

export type AdminRole = 'NEWS_ADMIN' | 'PAWN_ADMIN' | 'HR_ADMIN' | 'TREASURY_ADMIN' | 'DHA_ADMIN' | 'NONE';

export interface AuthState {
  isAdmin: boolean;
  staffName: string | null;
  role: AdminRole;
}
