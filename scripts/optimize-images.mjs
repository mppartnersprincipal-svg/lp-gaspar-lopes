/**
 * Gera as imagens otimizadas da LP (WebP + fallback JPG) em assets/img/.
 * Fontes: pastas originais "Fotos Gaspar", "Fotos - Produtos" e "Logo" (não são modificadas).
 * Uso: npm run images
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img');

// slug → { src, widths, aspect (l/a opcional p/ crop cover) }
const JOBS = [
  // Hero: Gaspar ajustando o punho (retrato real)
  { slug: 'hero', src: 'Fotos Gaspar/ROD02606.JPG', widths: [480, 800, 1200, 1600], aspect: 4 / 5 },
  // Autoridade: Gaspar pensativo
  { slug: 'autoridade', src: 'Fotos Gaspar/ROD02614.JPG', widths: [480, 800, 1200], aspect: 4 / 5, pos: 'top' },
  // Vitrine (6 categorias do PRD) — crop uniforme 4:5
  { slug: 'produto-camisas', src: 'Fotos - Produtos/Camisa/Camisa smoking.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-ternos', src: 'Fotos - Produtos/Costumes/Costume prin. gales cinza.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-costumes', src: 'Fotos - Produtos/Costumes/Costume 2 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-paletos', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-calcas', src: 'Fotos - Produtos/Calças/Calça cós duplo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-coletes', src: 'Fotos - Produtos/Colete/Colete.jpg', widths: [480, 800], aspect: 4 / 5 },
  // Coleção completa (galeria com filtro por categoria) — nomes reais dos arquivos do cliente
  { slug: 'colecao-costume-6botoes', src: 'Fotos - Produtos/Costumes/Costume 6 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-jaquetao-6botoes', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-jaquetao-6botoes-b', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões(3).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-kaban', src: 'Fotos - Produtos/Kaban/KABAN.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-fraque', src: 'Fotos - Produtos/Fraque/Fraque completo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-paleto-linho', src: 'Fotos - Produtos/Paletó/Paletó linho azul - tradicional (1).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-blazer-transpassado', src: 'Fotos - Produtos/Paletó/Blazer 1 botão- transpassado.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-forro-paleto', src: 'Fotos - Produtos/Paletó/Forro paletó linho azul.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-colete-sarja', src: 'Fotos - Produtos/Colete/Colete jaquetão sarja.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-calca-ghurka', src: 'Fotos - Produtos/Calças/Calça - Ghurka.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-calca-tradicional', src: 'Fotos - Produtos/Calças/Calça tradicional_.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-camisa-encorpada', src: 'Fotos - Produtos/Camisa/Camisa encorpada.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-punho-bordado', src: 'Fotos - Produtos/Punhos/Punho duplo camisa - bordado.jpg', widths: [480, 800], aspect: 4 / 5 },
  // Faixa full-width de detalhe artesanal (punho bordado) e fundo do CTA final (paletó em fundo escuro)
  { slug: 'banda-detalhe', src: 'Fotos - Produtos/Punhos/Punho duplo camisa - bordado.jpg', widths: [800, 1600], aspect: 21 / 9 },
  { slug: 'cta-fundo', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [800, 1600], aspect: 16 / 9 },
];

await mkdir(OUT, { recursive: true });

for (const job of JOBS) {
  const srcPath = path.join(ROOT, job.src);
  for (const w of job.widths) {
    const h = job.aspect ? Math.round(w / job.aspect) : null;
    const base = sharp(srcPath).rotate() // aplica orientação EXIF
      .resize(h ? { width: w, height: h, fit: 'cover', position: job.pos || 'attention' } : { width: w });
    const webpOut = path.join(OUT, `${job.slug}-${w}.webp`);
    const jpgOut = path.join(OUT, `${job.slug}-${w}.jpg`);
    await base.clone().webp({ quality: 78 }).toFile(webpOut);
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(jpgOut);
    console.log(`${job.slug}-${w}: webp + jpg ok`);
  }
}

// Open Graph 1200×630 (crop no topo do retrato do hero p/ pegar o rosto)
await sharp(path.join(ROOT, 'Fotos Gaspar/ROD02606.JPG')).rotate()
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(OUT, 'og-image.jpg'));
console.log('og-image ok');

// Logo branca (transparente) — só redimensionar
await mkdir(path.join(ROOT, 'assets', 'logo'), { recursive: true });
await sharp(path.join(ROOT, 'Logo/brancoPrancheta 1@2x.png'))
  .resize({ width: 640 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(ROOT, 'assets', 'logo', 'gaspar-lopes-logo.png'));
console.log('logo ok');
