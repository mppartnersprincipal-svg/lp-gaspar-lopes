export interface TextareaProps {
  label?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (e: any) => void;
  style?: React.CSSProperties;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
