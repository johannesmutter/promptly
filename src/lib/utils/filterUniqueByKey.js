/**
 * Filters an array of objects and returns an array with unique objects based on the specified key.
 * @param {Array<Record<string, any>> | undefined} array - The array to filter.
 * @param {string} key - The key to use for uniqueness check.
 * @returns {Array<Record<string, any>>} The filtered array containing unique objects.
 */
export function filterUniqueByKey(array, key) {
  if(!array){
    return []
  }
  return array.reduce((acc, item) => {
    if (item[key] && !acc.seenKeys.has(item[key])) {
      acc.seenKeys.add(item[key]);
      acc.uniqueItems.push(item);
    }
    return acc;
  }, { seenKeys: new Set(), uniqueItems: [] }).uniqueItems;
}
