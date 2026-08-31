export interface IconButtonProps {
  /** Icone (SVG/elemento) centralizado */
  children?: React.ReactNode;
  /** Diametro em px (default 44) */
  size?: number;
  variant?: 'outline' | 'navy' | 'solid';
  style?: React.CSSProperties;
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
