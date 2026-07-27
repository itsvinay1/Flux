import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// High-Precision 4K Vector SVG Master (1024x1024 Canvas)
const fullIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 4K Deep Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="40%" stop-color="#0F172A"/>
      <stop offset="80%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#070A10"/>
    </linearGradient>

    <!-- 3D Card Gradient (Electric Sky to Indigo to Violet) -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="35%" stop-color="#38BDF8"/>
      <stop offset="70%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>

    <!-- 3D Bevel Top Glass Highlight -->
    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0"/>
    </linearGradient>

    <!-- Crisp White Symbol Gradient -->
    <linearGradient id="fGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>

    <!-- 4K Ambient Neon Glow Filter -->
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="32" stdDeviation="36" flood-color="#0EA5E9" flood-opacity="0.5"/>
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#7C3AED" flood-opacity="0.4"/>
    </filter>

    <!-- 3D Text Shadow -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Deep Dark Canvas -->
  <rect width="1024" height="1024" rx="220" fill="url(#bgGrad)"/>

  <!-- 3D Raised Icon Shield -->
  <rect x="152" y="152" width="720" height="720" rx="180" fill="url(#cardGrad)" filter="url(#neonGlow)"/>

  <!-- Glossy Bevel Reflection -->
  <rect x="160" y="160" width="704" height="350" rx="172" fill="url(#highlightGrad)"/>

  <!-- Ultra-Bold Crisp 3D 'F' Symbol -->
  <path d="M 370 290 L 670 290 L 670 380 L 480 380 L 480 480 L 630 480 L 630 570 L 480 570 L 480 730 L 370 730 Z" 
        fill="url(#fGrad)" 
        filter="url(#textShadow)"/>
</svg>
`;

const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="fGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Adaptive Foreground Shield centered in Android 66% Safe Zone -->
  <rect x="212" y="212" width="600" height="600" rx="150" fill="url(#cardGrad)"/>
  <rect x="218" y="218" width="588" height="290" rx="144" fill="url(#highlightGrad)"/>

  <!-- Centered Bold 'F' Symbol -->
  <path d="M 394 330 L 630 330 L 630 400 L 482 400 L 482 485 L 600 485 L 600 555 L 482 555 L 482 690 L 394 690 Z" 
        fill="url(#fGrad)"/>
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

async function generate4KIcons() {
  console.log('✨ Rendering Ultra-Smooth 4K 3D FLUX "F" App Icons...');

  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Render with 4K Lanczos3 supersampling for ultra-smooth anti-aliased edges
    await sharp(Buffer.from(fullIconSvg))
      .resize(d.size, d.size, { kernel: sharp.kernel.lanczos3 })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round Icon with smooth vector mask
    await sharp(Buffer.from(fullIconSvg))
      .resize(d.size, d.size, { kernel: sharp.kernel.lanczos3 })
      .composite([{
        input: Buffer.from(`<svg width="${d.size}" height="${d.size}"><circle cx="${d.size/2}" cy="${d.size/2}" r="${d.size/2}" fill="#fff"/></svg>`),
        blend: 'dest-in'
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Foreground Adaptive Icon
    await sharp(Buffer.from(foregroundSvg))
      .resize(d.fgSize, d.fgSize, { kernel: sharp.kernel.lanczos3 })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(` 🌟 Generated ${d.name} (${d.size}x${d.size}) with 4K Lanczos3 anti-aliasing`);
  }

  console.log('🎉 4K Ultra-Smooth Android App Icons Generated Successfully!');
}

generate4KIcons().catch(console.error);
