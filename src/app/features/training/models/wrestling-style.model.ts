export type WrestlingStyle = 'freestyle' | 'greco-roman';

export function isWrestlingStyle(value: unknown): value is WrestlingStyle {
  return value === 'freestyle' || value === 'greco-roman';
}

export function wrestlingStyleLabel(style: WrestlingStyle): string {
  return style === 'freestyle' ? 'Freestyle' : 'Greco-Roman';
}
