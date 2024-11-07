type Color = Record<number, string>;

export const COLORS = {
  black100: '#020220',
  black50: '#9E9E9E',

  primary100: '#001A72',

  secondary100: '#38ACDD',
  secondary80: '#5BB9E0',
  secondary60: '#87CCE8',
  secondary40: '#B5E1F1',
  secondary20: '#E1F3FA',

  white100: '#FFFFFFFF',
  white75: '#FFFFFFBF',
  white50: '#FFFFFF80',
  white25: '#FFFFFF40',
} as const satisfies Record<string, Color>;
