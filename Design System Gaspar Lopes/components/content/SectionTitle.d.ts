export interface SectionTitleProps {
  /** Rotulo pequeno em caps largas acima do titulo */
  overline?: string;
  title?: string;
  /** Palavra final em serifado italico (acento editorial) */
  accent?: string;
  align?: 'center' | 'left';
  style?: React.CSSProperties;
}
export declare function SectionTitle(props: SectionTitleProps): JSX.Element;
