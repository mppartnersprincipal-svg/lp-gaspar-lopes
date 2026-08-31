export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  type?: string;
  /** Mensagem de erro; muda a linha para vermelho */
  error?: string;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
