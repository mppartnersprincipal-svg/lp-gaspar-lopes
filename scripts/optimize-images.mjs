/**
 * Gera as imagens otimizadas da LP (WebP + fallback JPG) em assets/img/.
 * Fontes: pastas originais "Fotos Gaspar", "Fotos - Produtos" e "Logo" (não são modificadas).
 * Uso: npm run images            → gera tudo
 *      npm run images destaque   → só os slugs que começam com "destaque" (pula OG/logo)
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img');

// slug → { src, widths, aspect (l/a opcional p/ crop cover), crop (recorte prévio em frações 0-1, p/ aproximar) }
const JOBS = [
  // Hero: Gaspar ajustando o punho (retrato real)
  { slug: 'hero', src: 'Fotos Gaspar/Hero - Gaspar costume cinza.jpg', widths: [480, 800, 1200, 1600], aspect: 4 / 5, crop: { left: 0, top: 0.053, width: 0.694, height: 0.579 } },
  // Autoridade (carrossel "Quem faz" — 4 retratos, crop uniforme 4:5)
  { slug: 'autoridade-1', src: 'Fotos Gaspar/ROD02614.JPG', widths: [480, 800, 1200], aspect: 4 / 5, pos: 'top' },      // pensativo, sentado
  { slug: 'autoridade-2', src: 'Fotos Gaspar/ROD02652.JPG', widths: [480, 800, 1200], aspect: 4 / 5 },                  // sorriso, mão no queixo
  { slug: 'autoridade-3', src: 'Fotos Gaspar/ROD02640.JPG', widths: [480, 800, 1200], aspect: 4 / 5, pos: 'top' },      // em pé, mãos no bolso
  { slug: 'autoridade-4', src: 'Fotos Gaspar/ROD02627.JPG', widths: [480, 800, 1200], aspect: 4 / 5 },                  // sentado, olhar direto
  // Vitrine (6 categorias do PRD) — crop uniforme 4:5
  { slug: 'produto-camisas', src: 'Fotos - Produtos/Camisa/Camisa branca social.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-ternos', src: 'Fotos - Produtos/Ternos/Terno bege - cerimonia.jpg', widths: [480, 800], aspect: 4 / 5, pos: 'top' },
  { slug: 'produto-costumes', src: 'Fotos - Produtos/Costumes/Costume azul - externo.jpg', widths: [480, 800], aspect: 4 / 5, crop: { left: 0.334, top: 0.342, width: 0.512, height: 0.427 } },
  { slug: 'produto-paletos', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-calcas', src: 'Fotos - Produtos/Calças/Calça cós duplo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-coletes', src: 'Fotos - Produtos/Colete/Colete marrom trespassado.jpg', widths: [480, 800], aspect: 4 / 5 },
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
  { slug: 'colecao-camiseta-polo', src: 'Fotos - Produtos/Camiseta/Camiseta polo preta.jpg', widths: [480, 800], aspect: 4 / 5 },
  // Faixa full-width de detalhe artesanal (punho bordado) e fundo do CTA final (paletó em fundo escuro)
  { slug: 'banda-detalhe', src: 'Fotos Gaspar/Detalhe - lapela costume azul.jpg', widths: [800, 1600], aspect: 21 / 9, pos: 'centre' },
  { slug: 'cta-fundo', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [800, 1600], aspect: 16 / 9 },
  // Destaques (carrossel com autoplay) — fotos do cliente que NÃO aparecem nas outras seções
  { slug: 'destaque-jaquetao-risca-giz', src: 'Fotos - Produtos/Jaquetão/Jaquetão Risca de giz.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-paleto-1botao', src: 'Fotos - Produtos/Paletó/Paletó 1 botão.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-colete-principe-gales', src: 'Fotos - Produtos/Colete/Colete feminino - principe de gales azul.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-jaquetao-6botoes-offwhite', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões(2).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-camisa-encorpada', src: 'Fotos - Produtos/Camisa/Camisa encorpada(1).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-kaban', src: 'Fotos - Produtos/Kaban/KABAN(1).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-paleto-2botoes', src: 'Fotos - Produtos/Costumes/Paletó 2 botões_.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-gola-polo', src: 'Fotos - Produtos/Camiseta/Gola Polo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-jaquetao-6botoes-oliva', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões(1).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'destaque-camiseta-gola-o', src: 'Fotos - Produtos/Camiseta/Camiseta _O_ média.jpg', widths: [480, 800], aspect: 4 / 5 },
];

// Filtro opcional por prefixo de slug (ex.: `npm run images destaque`)
const ONLY = process.argv[2];
const jobs = ONLY ? JOBS.filter((j) => j.slug.startsWith(ONLY)) : JOBS;

await mkdir(OUT, { recursive: true });

for (const job of jobs) {
  const srcPath = path.join(ROOT, job.src);
  for (const w of job.widths) {
    const h = job.aspect ? Math.round(w / job.aspect) : null;
    let pipe = sharp(srcPath).rotate(); // aplica orientação EXIF
    if (job.crop) {
      const meta = await sharp(srcPath).metadata();
      // metadata() traz as dimensões do arquivo; com orientação EXIF 5-8 o .rotate() troca l/a
      const swap = meta.orientation >= 5 && meta.orientation <= 8;
      const cw = swap ? meta.height : meta.width;
      const ch = swap ? meta.width : meta.height;
      pipe = pipe.extract({
        left: Math.round(job.crop.left * cw),
        top: Math.round(job.crop.top * ch),
        width: Math.round(job.crop.width * cw),
        height: Math.round(job.crop.height * ch),
      });
    }
    const base = pipe.resize(h ? { width: w, height: h, fit: 'cover', position: job.pos || 'attention' } : { width: w });
    const webpOut = path.join(OUT, `${job.slug}-${w}.webp`);
    const jpgOut = path.join(OUT, `${job.slug}-${w}.jpg`);
    await base.clone().webp({ quality: 78 }).toFile(webpOut);
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(jpgOut);
    console.log(`${job.slug}-${w}: webp + jpg ok`);
  }
}

if (ONLY) { console.log(`filtro "${ONLY}": ${jobs.length} job(s); OG e logo não regenerados`); process.exit(0); }

// Open Graph 1200×630 (crop no topo do retrato do hero p/ pegar o rosto)
await sharp(path.join(ROOT, 'Fotos Gaspar/Hero - Gaspar costume cinza.jpg')).rotate()
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
