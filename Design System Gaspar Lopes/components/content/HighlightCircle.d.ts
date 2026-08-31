/**
 * @startingPoint section="Componentes" subtitle="Circulo de destaque estilo Instagram da marca" viewport="700x220"
 */
export interface HighlightCircleProps {
  /** Rotulo abaixo do circulo (ex.: "Clientes") */
  label?: string;
  /** Imagem de capa (ex.: assets/highlights/highlight-0.png) */
  src?: string;
  /** Alternativa a src: icone/texto centralizado no circulo navy */
  children?: React.ReactNode;
  /** Diametro em px (default 96) */
  size?: number;
  /** Anel claro de estado ativo */
  active?: boolean;
  onClick?: () => void;
}
export declare function HighlightCircle(props: HighlightCircleProps): JSX.Element;
