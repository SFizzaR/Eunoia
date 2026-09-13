export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
