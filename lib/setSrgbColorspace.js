import sharp from 'sharp';

export default async function setSrgbColorspace(buffer) {
  const image = await sharp(buffer);
  const metadata = await image.metadata();

  return metadata.space === 'srgb'
    ? buffer
    : image.toColorspace('srgb').toBuffer();
}
