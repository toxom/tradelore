export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    href: string;
    button?: ButtonProps;
  }
  
  export interface ButtonProps {
    primary?: boolean;
    backgroundColor?: string;
    size?: 'small' | 'medium' | 'large';
    label: string;
    onClick?: () => void;
  }
  
  export interface AuthProps {
      user?: { name: string };
      onLogin?: () => void;
      onLogout?: () => void;
      onCreateAccount?: () => void;
    }