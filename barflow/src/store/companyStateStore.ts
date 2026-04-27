import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface Company {
  id: string;
  name: string;
  document: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  logo_url?: string;
  active: boolean;
  created_at: string;
}

interface CompanyState {
  companies: Company[];
  currentCompanyId: string | null;
  
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Omit<Company, 'id' | 'created_at'>) => Company;
  updateCompany: (id: string, data: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  setCurrentCompany: (id: string) => void;
  getCurrentCompany: () => Company | undefined;
}

const demoCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'BarFlow Centro',
    document: '12.345.678/0001-90',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 99999-1111',
    active: true,
    created_at: '2024-01-01',
  },
  {
    id: 'comp-2',
    name: 'BarFlow Zona Sul',
    document: '98.765.432/0001-09',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 99999-2222',
    active: true,
    created_at: '2024-03-15',
  },
  {
    id: 'comp-3',
    name: 'BarFlow Pinheiros',
    document: '11.223.344/0001-55',
    address: 'Av. Faria Lima, 2000',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 99999-3333',
    active: true,
    created_at: '2024-06-01',
  },
];

export const useCompanyStateStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: demoCompanies,
      currentCompanyId: 'comp-1',

      setCompanies: (companies) => set({ companies }),

      addCompany: (data) => {
        const newCompany: Company = {
          ...data,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ companies: [...state.companies, newCompany] }));
        return newCompany;
      },

      updateCompany: (id, data) => {
        set((state) => ({
          companies: state.companies.map(c => 
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter(c => c.id !== id),
          currentCompanyId: state.currentCompanyId === id ? null : state.currentCompanyId,
        }));
      },

      setCurrentCompany: (id) => set({ currentCompanyId: id }),

      getCurrentCompany: () => {
        const state = get();
        return state.companies.find(c => c.id === state.currentCompanyId);
      },
    }),
    {
      name: 'barflow-companies',
    }
  )
);