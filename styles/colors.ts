type Color = Record<number, string>;

export const COLORS = {
  black100: "#161127",
  black90: '#161127E6',
  black75: "#161127BF",
  black50: "#16112780",
  black25: "#16112740",

  white100: "#FFFFFFFF",
  white75: "#FFFFFFBF",
  white50: "#FFFFFF80",
  white25: "#FFFFFF40",

  red100: "#86081E",
  red80: "#BF0D2A",
  red60: "#EF193E",
  red40: "#F24664",
  red20: "#F78D9E",
  red0: "#FBC6CF",

  purple100: "#302555",
  purple80: "#493880",
  purple60: "#624BAA",
  purple40: "#8471C1",
  purple20: "#A99CD3",

  gray50: '#424242',
  green100: "#0C662F",
  green60: "#3DA362",
  green20: "#A4D7AF",
} as const satisfies Record<string, Color>;
