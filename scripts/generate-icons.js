const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets', 'images');
const svgSourcePath = path.join(assetsDir, 'tuition-icon.svg');

const svg = fs.readFileSync(svgSourcePath, 'utf8');
const size = 1024;

const writePng = async (fileName, transform) => {
  const outputPath = path.join(assetsDir, fileName);
  const pipeline = sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

  const final = typeof transform === 'function' ? transform(pipeline) : pipeline;
  await final.png().toFile(outputPath);
};

(async () => {
  try {
    // 1) Main app icon: brown background + cream/mustard symbol
    await writePng('icon.png');

    // 2) Android foreground: transparent bg + symbol centered with safe-zone padding
    await writePng('android-icon-foreground.png', (pipeline) =>
      pipeline
        .composite([
          {
            input: Buffer.from(`
              <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <rect width="1024" height="1024" fill="transparent"/>
              </svg>
            `),
            top: 0,
            left: 0,
          },
        ])
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    );

    // 3) Android background: plain solid coffee brown
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 139, g: 94, b: 60, alpha: 1 },
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'android-icon-background.png'));

    // 4) Android monochrome: same symbol, white only
    const monochromeSvg = `
      <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="transparent"/>
        <path d="M258 312L512 182L766 312L512 442L258 312Z" fill="#FFFFFF"/>
        <path d="M316 338L512 426L708 338V386C708 386 603 470 512 470C421 470 316 386 316 386V338Z" fill="#FFFFFF"/>
        <rect x="485" y="420" width="54" height="182" rx="22" fill="#FFFFFF"/>
        <circle cx="512" cy="160" r="34" fill="#FFFFFF"/>
        <path d="M512 130L538 160L512 190L486 160L512 130Z" fill="#FFFFFF"/>
        <path d="M286 552C331 528 387 518 440 527L440 745C384 737 326 744 286 770V552Z" fill="#FFFFFF"/>
        <path d="M738 552C693 528 637 518 584 527V745C640 737 698 744 738 770V552Z" fill="#FFFFFF"/>
        <path d="M440 535H584V762C533 744 489 744 440 762V535Z" fill="#FFFFFF"/>
        <path d="M440 535H584" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round"/>
        <path d="M286 552C331 528 387 518 440 527" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
        <path d="M738 552C693 528 637 518 584 527" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
        <path d="M440 745C489 733 533 733 584 745" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
        <path d="M440 536V762" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
        <path d="M584 536V762" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
        <path d="M512 470V760" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
      </svg>
    `;

    await sharp(Buffer.from(monochromeSvg)).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(assetsDir, 'android-icon-monochrome.png'));

    console.log('✅ Icon files generated successfully');
    console.log('Files:', [
      'icon.png',
      'android-icon-foreground.png',
      'android-icon-background.png',
      'android-icon-monochrome.png',
    ].join(', '));
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
})();
