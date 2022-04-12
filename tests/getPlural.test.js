const getPlural = require('../lib/getPlural');

test('Should return “image” if num equals 1', () => {
  expect(getPlural(1, 'image', 'images')).toBe('image');
});

test('Should return “images” if num equals 2', () => {
  expect(getPlural(2, 'image', 'images')).toBe('images');
});
