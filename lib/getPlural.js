export default function getPlural(num, one, many) {
  return Math.abs(num) === 1 ? one : many;
}
