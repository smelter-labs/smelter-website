// darkModeColorsPlugin.ts

import plugin from 'tailwindcss/plugin';

const TRANSITION_DURATION = '300ms';
const PREFIXES = ['text', 'bg', 'border'] as const;

const tokenWind = plugin(options => {
  const { addUtilities, theme, config } = options;

  const colors = theme('colors');
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const transitionClasses = [];

  const colorMappingConfig: Record<string, string> = config('tokenWind.colorMap');

  const utilities = Object.entries(colorMappingConfig).reduce(
    (acc, [lightKey, darkKey]) => {
      acc[`.bg-${lightKey}`] = {
        [`@apply bg-[${theme(`colors.${lightKey}`)}]`]: {},
        '.dark &': {
          [`@apply bg-[${theme(`colors.${darkKey}`)}]`]: {},
        },
      };

      // Extend for other utilities like text or border colors if needed

      return acc;
    },
    {} as Record<string, unknown>
  );

  // Add theme transition handler

  const transitionPrefixes = [...PREFIXES];

  if (colors)
    Object.keys(colors).forEach(color => {
      transitionPrefixes.forEach(prefix => {
        const transitionClass = {
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

  addUtilities(utilities, {
    variants: ['responsive', 'hover', 'focus', 'dark'],
  });
  addUtilities(transitionClasses, { variants: ['responsive'] });
});

export default tokenWind;
