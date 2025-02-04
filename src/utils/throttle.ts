// Common definitions and utility functions
type Func = (...args: any[]) => any;
interface DebounceOptions {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
}

const FUNC_ERROR_TEXT = "Expected a function";
const NAN = 0 / 0;

const symbolTag = "[object Symbol]";
const reTrim = /^\s+|\s+$/g;
const reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
const reIsBinary = /^0b[01]+$/i;
const reIsOctal = /^0o[0-7]+$/i;

const freeParseInt = Number.parseInt;
const root = globalThis; // Use globalThis as the root object

const nativeMax = Math.max,
  nativeMin = Math.min;

const objectProto = Object.prototype;
const objectToString = objectProto.toString;

function now(): number {
  return root.Date.now();
}

function isObject(value: unknown): value is object {
  const type = typeof value;
  return !!value && (type == "object" || type == "function");
}

function isObjectLike(value: unknown): boolean {
  return !!value && typeof value == "object";
}

function isSymbol(value: unknown): boolean {
  return (
    typeof value == "symbol" || (isObjectLike(value) && objectToString.call(value) == symbolTag)
  );
}

function toNumber(value: unknown): number {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    const other = typeof (value as any).valueOf == "function" ? (value as any).valueOf() : value;
    value = isObject(other) ? String(other) : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, "");
  const isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value)
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : reIsBadHex.test(value)
      ? NAN
      : +value;
}

// Debounce function implementation
export function debounce(func: Func, wait = 0, options: DebounceOptions = {}): Func {
  let lastArgs: any[],
    lastThis: any,
    maxWait: number,
    result: any,
    timerId: ReturnType<typeof setTimeout> | undefined,
    lastCallTime: number,
    lastInvokeTime = 0,
    leading = false,
    maxing = false,
    trailing = true;

  if (typeof func !== "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  leading = !!options.leading;
  maxing = "maxWait" in options;
  maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : wait;
  trailing = "trailing" in options ? !!options.trailing : trailing;

  const invokeFunc = (time: number) => {
    const args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  // Additional methods in debounce like `cancel`, `flush`, etc., should be implemented here

  return function debounced(...args: any[]): any {
    // Implementation details for debounced function
  } as Func;
}

// Throttle function implementation using debounce
export function throttle(
  func: Func,
  wait = 0,
  options: DebounceOptions = { leading: true, trailing: true }
): Func {
  const { leading, trailing } = options;
  return debounce(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing,
  });
}
