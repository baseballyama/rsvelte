const $$destructure_array = (value, count = Infinity) => {
  if (Array.isArray(value)) return value;
  const result = [];
  if (count === 0) return result;
  for (const item of value) {
    result.push(item);
    if (result.length === count) break;
  }
  return result;
};
const $$destructure_rest = (value, excluded) => {
  if (value == null) throw new TypeError('Cannot destructure null or undefined');
  const keys = new Set(excluded.map((key) => typeof key === 'symbol' ? key : String(key)));
  const result = {};
  for (const key in value) {
    if (!keys.has(key)) result[key] = value[key];
  }
  Object.getOwnPropertySymbols(value).forEach((key) => {
    if (!keys.has(key) && Object.propertyIsEnumerable.call(value, key)) result[key] = value[key];
  });
  return result;
};
