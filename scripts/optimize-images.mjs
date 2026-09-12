/**
 * Gera as imagens otimizadas da LP (WebP + fallback JPG) em assets/img/.
 * Fontes: pastas originais "Fotos Gaspar", "Fotos - Produtos" e "Logo" (não são modificadas).
 * Uso: npm run images            → gera tudo
 *      npm run images colecao    → só os slugs que começam com "colecao" (pula OG/logo)
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img');

// slug → { src, widths, aspect (l/a opcional p/ crop cover), crop (recorte prévio em frações 0-1, p/ aproximar) }
const JOBS = [
  // Hero: Gaspar de costume cinza (retrato). Pedido do cliente (11/09/2026): centralizar a PEÇA, não o rosto.
  // Recorte 4:5 de largura total; o costume fica no centro e o object-position (CSS) puxa o quadro
  // para o tronco no desktop, deixando o rosto fora da dobra.
  { slug: 'hero', src: 'Fotos Gaspar/Hero - Gaspar costume cinza.jpg', widths: [480, 800, 1200, 1600], aspect: 4 / 5, crop: { left: 0, top: 0.12, width: 1, height: 0.8333 } },
  // Autoridade (carrossel "Quem faz" — 3 retratos, crop uniforme 4:5). Troca de 12/09/2026: só o retrato sentado ficou;
  // as fotos do WhatsApp têm 1066 e 854px de largura, por isso não geram a versão 1200 (não ampliar).
  { slug: 'autoridade-4', src: 'Fotos Gaspar/ROD02627.JPG', widths: [480, 800, 1200], aspect: 4 / 5 },                  // sentado, olhar direto
  { slug: 'autoridade-5', src: 'Fotos Gaspar/WhatsApp Image 2026-09-11 at 13.57.58.jpeg', widths: [480, 800], aspect: 4 / 5, pos: 'centre' }, // camisa e gravata, em atendimento
  { slug: 'autoridade-6', src: 'Fotos Gaspar/WhatsApp Image 2026-09-11 at 14.00.00.jpeg', widths: [480, 800], aspect: 4 / 5, pos: 'centre' }, // com o diploma da Câmara
  // Vitrine (6 categorias do PRD) — crop uniforme 4:5
  { slug: 'produto-camisas', src: 'Fotos - Produtos/Camisa/Camisa branca social.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-ternos', src: 'Fotos - Produtos/Ternos/Terno azul claro - cerimonia.jpg', widths: [480, 800], aspect: 4 / 5, pos: 'centre' },
  { slug: 'produto-costumes', src: 'Fotos - Produtos/Costumes/Costume azul - externo.jpg', widths: [480, 800], aspect: 4 / 5, crop: { left: 0.334, top: 0.342, width: 0.512, height: 0.427 } },
  { slug: 'produto-paletos', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-calcas', src: 'Fotos - Produtos/Calças/Calça cós duplo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'produto-coletes', src: 'Fotos - Produtos/Colete/Colete marrom trespassado.jpg', widths: [480, 800], aspect: 4 / 5 },
  // Coleção completa (galeria com filtro por categoria) — nomes reais dos arquivos do cliente
  { slug: 'colecao-costume-6botoes', src: 'Fotos - Produtos/Costumes/Costume 6 botões.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-jaquetao-6botoes', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões - verde.jpg', widths: [480, 800], aspect: 4 / 5, pos: 'centre' },
  { slug: 'colecao-jaquetao-6botoes-b', src: 'Fotos - Produtos/Jaquetão/Jaquetão 6 botões(3).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-kaban', src: 'Fotos - Produtos/Kaban/KABAN.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-fraque', src: 'Fotos - Produtos/Fraque/Fraque completo.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-paleto-linho', src: 'Fotos - Produtos/Paletó/Paletó linho azul - tradicional (1).jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-blazer-transpassado', src: 'Fotos - Produtos/Paletó/Blazer 1 botão- transpassado.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-colete-sarja', src: 'Fotos - Produtos/Colete/Colete jaquetão sarja.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-camisa-encorpada', src: 'Fotos - Produtos/Camisa/Camisa encorpada.jpg', widths: [480, 800], aspect: 4 / 5 },
  { slug: 'colecao-punho-duplo', src: 'Fotos - Produtos/Punhos/Punho duplo.jpg', widths: [480, 800], aspect: 4 / 5, pos: 'centre' },
  { slug: 'colecao-camiseta-polo', src: 'Fotos - Produtos/Camiseta/Camiseta polo preta.jpg', widths: [480, 800], aspect: 4 / 5 },
  // Faixa full-width de detalhe artesanal (lapela com pesponto à mão; 16:9, sem degradê por pedido do cliente)
  // e fundo do CTA final (paletó em fundo escuro)
  { slug: 'banda-detalhe', src: 'Fotos Gaspar/Detalhe - lapela costume azul.jpg', widths: [800, 1600], aspect: 16 / 9, pos: 'centre' },
  { slug: 'cta-fundo', src: 'Fotos - Produtos/Paletó/Paletó 2 botões.jpg', widths: [800, 1600], aspect: 16 / 9 },
];

// Filtro opcional por prefixo de slug (ex.: `npm run images colecao`)
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
