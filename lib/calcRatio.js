module.exports = function calcRatio(from, to) {
  return Math.round((to - from) / from * 100);
};
