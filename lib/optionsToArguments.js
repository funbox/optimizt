export default function optionsToArguments({ options, prefix = '--', concat = false }) {
  return Object.keys(options).reduce((acc, key) => {
    const value = options[key];
    const shouldAddKey = value !== false;
    const shouldAddValue = value !== true;

    if (!shouldAddKey) return acc;

    return acc.concat(
      [`${prefix}${key}${(shouldAddValue && concat ? [`=${value}`] : [])}`],
      shouldAddValue && !concat ? [value] : [],
    );
  }, []);
}
