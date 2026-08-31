/**
 * @startingPoint section="Componentes" subtitle="Botao da marca — primario, navy, outline, ghost" viewport="700x300"
 */
export interface ButtonProps {
  /** 'primary' (claro sobre escuro, CTA principal) | 'navy' | 'outline' | 'ghost' */
  variant?: 'primary' | 'navy' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Icone opcional (elemento) antes do rotulo */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
