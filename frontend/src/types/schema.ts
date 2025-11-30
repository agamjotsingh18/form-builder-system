// frontend/src/types/schema.ts

export type FieldType = 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'textarea' | 'switch';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidations {
  minLength?: number; // text, textarea [cite: 37]
  maxLength?: number; // text, textarea [cite: 37]
  regex?: string; // text [cite: 38]
  min?: number; // number [cite: 39]
  max?: number; // number [cite: 39]
  minDate?: string; // date [cite: 40]
  minSelected?: number; // multi-select [cite: 41]
  maxSelected?: number; // multi-select [cite: 41]
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean; 
  options?: FieldOption[]; 
  validations?: FieldValidations;
}

export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}