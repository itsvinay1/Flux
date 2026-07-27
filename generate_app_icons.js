import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Define SVG source for 3D FLUX 'F' App Icon
const fullIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#090D16"/>
    </linearGradient>

    <!-- 3D Card Container Gradient -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>

    <!-- F Text Gradient -->
    <linearGradient id="fGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>

    <!-- Shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0EA5E9" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Dark Background Canvas -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>

  <!-- 3D Glassmorphic Container -->
  <rect x="76" y="76" width="360" height="360" rx="90" fill="url(#cardGrad)" filter="url(#shadow)"/>
  
  <!-- Subtle Top Highlight -->
  <rect x="80" y="80" width="352" height="175" rx="86" fill="#FFFFFF" fill-opacity="0.18"/>

  <!-- Symbol 'F' -->
  <text x="256" y="340" font-family="'Outfit', 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="270" fill="url(#fGrad)" text-anchor="middle" letter-spacing="-6">F</text>
</svg>
`;

const foregroundSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="fGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
  </defs>

  <!-- 3D Glassmorphic Container centered in safe zone -->
  <rect x="106" y="106" width="300" height="300" rx="75" fill="url(#cardGrad)"/>
  <rect x="110" y="110" width="292" height="145" rx="70" fill="#FFFFFF" fill-opacity="0.2"/>

  <!-- Symbol 'F' -->
  <text x="256" y="325" font-family="'Outfit', 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="220" fill="url(#fGrad)" text-anchor="middle" letter-spacing="-5">F</text>
</svg>
`;

const densities = [
  { name: 'mipmap-mdpi', size: 48, fgSize: 48 },
  { name: 'mipmap-hdpi', size: 72, fgSize: 72 },
  { name: 'mipmap-xhdpi', size: 96, fgSize: 96 },
  { name: 'mipmap-xxhdpi', size: 144, fgSize: 144 },
  { name: 'mipmap-xxxhdpi', size: 192, fgSize: 192 },
];

const resDir = path.resolve('android/app/src/main/res');

async function generateIcons() {
  console.log('🚀 Generating 3D FLUX "F" App Icons for Android...');

  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Full Launcher Icon
    await sharp(Buffer.from(fullIconSvg))
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round Launcher Icon
    await sharp(Buffer.from(fullIconSvg))
      .resize(d.size, d.size)
      .composite([{
        input: Buffer.from(`<svg><circle cx="${d.size/2}" cy="${d.size/2}" r="${d.size/2}" fill="#fff"/></svg>`),
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Foreground Icon
    await sharp(Buffer.from(foregroundSvg))
      .resize(d.fgSize, d.fgSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(` ✅ Generated ${d.name} (${d.size}x${d.size})`);
  }

  console.log('🎉 All Android mipmap icons generated successfully!');
}

generateIcons().catch(console.error);
