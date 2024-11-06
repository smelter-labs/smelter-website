type Theme = Record<string, any>;
type DynamicColors = Record<string, string>;

const generateTheme = (theme: Theme, darkMode: boolean): DynamicColors => {
  const dynamicColors: DynamicColors = {};

  function traverse(obj: Theme, stack: string = ''): void {
    for (const property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) continue;

      let newStack = stack ? `${stack}-${property}` : property;

      if (typeof obj[property] === 'object') {
        traverse(obj[property] as Theme, newStack);
      } else {
        newStack = darkMode ? newStack : `${newStack}-light`;
        dynamicColors[newStack] = obj[property];
      }
    }
  }

  traverse(theme.colors);
  return dynamicColors;
};

const mapToNightwind = (theme: Theme): Record<string, string> => {
  const mapper: Record<string, string> = {};

  function traverse(obj: Theme, stack: string = ''): void {
    for (const property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) continue;

      const newStack = stack ? `${stack}-${property}` : property;

      if (typeof obj[property] === 'object') {
        traverse(obj[property] as Theme, newStack);
      } else {
        mapper[newStack] = `${newStack}-light`;
      }
    }
  }

  traverse(theme.colors);
  return mapper;
};

export { generateTheme, mapToNightwind };
