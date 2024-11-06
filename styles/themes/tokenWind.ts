import plugin from 'tailwindcss/plugin';
import type { CSSRuleObject } from 'tailwindcss/types/config';

const TRANSITION_DURATION = '300ms';
const PREFIXES = ['text', 'bg', 'border'] as const;

const tokenWind = plugin(options => {
  const { addUtilities, theme, config } = options;

  const colors = theme('colors');
  const transitionClasses: Array<CSSRuleObject> = [];

  const colorMappingConfig: Record<string, string> = config('tokenWind.colorMap');

  const utilities = Object.entries(colorMappingConfig).reduce((acc, [lightKey, darkKey]) => {
    PREFIXES.forEach(prefix => {
      acc[`.${prefix}-${lightKey}`] = {
        [`@apply ${prefix}-[${theme(`colors.${lightKey}`)}]`]: {},
        '.dark &': {
          [`@apply ${prefix}-[${theme(`colors.${darkKey}`)}]`]: {},
        },
      };
    });

    return acc;
  }, {} as CSSRuleObject);

  const transitionPrefixes = [...PREFIXES];

  if (colors)
    Object.keys(colors).forEach(color => {
      transitionPrefixes.forEach(prefix => {
        const transitionClass: CSSRuleObject = {
          [`.tokenwind .${prefix}-${color}`]: {
            transitionDuration: TRANSITION_DURATION,
            transitionProperty: theme('transitionProperty.colors'),
          },
          [`.tokenwind .dark\\:${prefix}-${color}`]: {
            transitionDuration: TRANSITION_DURATION,
            transitionProperty: theme('transitionProperty.colors'),
          },
        };
        transitionClasses.push(transitionClass);
      });
    });

  addUtilities(utilities);
  addUtilities(transitionClasses);
});

export default tokenWind;
