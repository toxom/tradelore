import type { RecordModel } from 'pocketbase'; 

export interface User extends RecordModel {
    username: string;
    email: string;
    emailVisibility: boolean;
    verified: boolean;
    name?: string;
    avatar: string;
    role: string;
    network_preferences: string[];
    preferences: string[];
    messages: string[];
    last_login: Date;
}

interface FinancialRecord {
    // Define the structure of a financial record
    date: Date;
    amount: number;
    description: string;
    type: 'income' | 'expense';
  }
  
  interface Preference {
    // Define the structure of a preference
    key: string;
    value: string | number | boolean;
  }
  
  interface ExternalAccount {
    // Define the structure of an external account
    accountName: string;
    accountNumber: string;
    bankName: string;
  }
  
  interface PaymentMethod {
    // Define the structure of a payment method
    type: 'credit_card' | 'bank_transfer' | 'paypal' | 'other';
    details: Record<string, string>;
  }
  
  interface CatalogueItem {
    // Define the structure of a catalogue item
    id: string;
    name: string;
    description: string;
    price: number;
  }
  
  export interface BusinessAccount extends RecordModel {
    name: string;
    business_email: string;
    business_type: 'sole proprietorship' | 'llc' | 'inc' | 'lp' | 'np' | string;
    industry: 'retail' | 'manufacturing' | 'services' | string;
    business_address: string;
    year_established: number;
    city: string;
    country: string;
    phone_number: string;
    website: string;
    currency: string;
    financial_records: FinancialRecord[];
    preferences: Preference[];
    external_accounts: ExternalAccount[];
    business_logo: string;
    payment_methods: PaymentMethod[];
    languages: string[];
    parent_company: string | null; 
    subsidiaries: string[] | null; 
    accreditations: string[];
    catalogue: CatalogueItem[];
    employee_count: number;
    customer_segment: ('b2b' | 'b2c' | 'b2b2c' | 'c2c' | 'b2g' | 'd2c' | 'b2e' | 'p2p')[];
}