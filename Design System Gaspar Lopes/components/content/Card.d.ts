export interface CardProps {
  children?: React.ReactNode;
  /** Superficie navy elevada com sombra */
  raised?: boolean;
  padding?: number | string;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
