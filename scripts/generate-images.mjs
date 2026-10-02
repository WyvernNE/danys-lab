// Génère toutes les illustrations du site (logo, favicons, avatar, bannière,
// couvertures d'articles et de projets, image de partage).
//
//   pnpm images
//
// Les couvertures d'articles n'ont pas de texte : le thème les recadre en
// miniature et affiche déjà le titre juste au-dessus.
//
// Chaque image est dessinée en SVG puis convertie par sharp (déjà installé
// avec Astro). Modifie les couleurs ou les textes ci-dessous, puis relance.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const C = {
	espresso: "#2b1a12",
	brown: "#6f4a32",
	caramel: "#a8714a",
	latte: "#e0b98f",
	cream: "#f6e7d8",
	matcha: "#7d9a4f",
	matchaLight: "#b5cc85",
	oat: "#efe3cf",
};
const SANS = "DejaVu Sans, Liberation Sans, Arial, sans-serif";

async function save(svg, file, { width, height, format = "webp" } = {}) {
	mkdirSync(dirname(file), { recursive: true });
	let img = sharp(Buffer.from(svg));
	if (width) img = img.resize(width, height);
	if (format === "png") img = img.png();
	else if (format === "jpg") img = img.jpeg({ quality: 88, mozjpeg: true });
	else img = img.webp({ quality: 88 });
	await img.toFile(file);
	console.log("✓", file);
}

// Petit générateur pseudo-aléatoire déterministe : mêmes images à chaque run.
function rng(seed) {
	return () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
}

// Grains de café éparpillés en fond.
function beans(w, h, count, seed, color = C.cream, opacity = [0.06, 0.14]) {
	const r = rng(seed);
	let out = "";
	for (let i = 0; i < count; i++) {
		const x = r() * w;
		const y = r() * h;
		const s = 10 + r() * 18;
		const a = r() * 180;
		const o = opacity[0] + r() * (opacity[1] - opacity[0]);
		out += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a.toFixed(0)})" opacity="${o.toFixed(2)}">
			<ellipse rx="${s.toFixed(0)}" ry="${(s * 0.68).toFixed(0)}" fill="${color}"/>
			<path d="M${-s} 0q${s / 2} ${-s / 3} ${s} 0t${s} 0" fill="none" stroke="${C.espresso}" stroke-width="3"/></g>`;
	}
	return out;
}

function steam(x, y, height, color = C.cream, opacity = 0.5, width = 10, gap = 34) {
	return [-1, 0, 1]
		.map(
			(i) =>
				`<path d="M${x + i * gap} ${y} c-18 ${-height * 0.25} 18 ${-height * 0.45} 0 ${-height * 0.7} s18 ${-height * 0.2} 0 ${-height * 0.3}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`,
		)
		.join("");
}

function gradientBg(w, h, from, mid, to, glow = "#ffe2bf") {
	return `<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="${from}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${to}"/>
		</linearGradient>
		<radialGradient id="glow" cx="0.72" cy="0.3" r="0.6">
			<stop offset="0" stop-color="${glow}" stop-opacity="0.35"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/>
		</radialGradient>
	</defs>
	<rect width="${w}" height="${h}" fill="url(#bg)"/>
	<rect width="${w}" height="${h}" fill="url(#glow)"/>`;
}

// ── Logo : tasse + « D » ──────────────────────────────────────────────────
const logo = (bg, fg, accent) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
	<rect width="512" height="512" rx="128" fill="${bg}"/>
	<path d="M120 200h220v96a110 110 0 0 1-110 110a110 110 0 0 1-110-110z" fill="${fg}"/>
	<path d="M340 222h22a46 46 0 0 1 0 92h-30" fill="none" stroke="${fg}" stroke-width="26" stroke-linecap="round"/>
	<text x="230" y="352" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="150" fill="${bg}">D</text>
	<path d="M190 160c-14-22 14-34 0-60M240 160c-14-22 14-34 0-60M290 160c-14-22 14-34 0-60" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>
</svg>`;
const logoLight = logo(C.brown, C.cream, C.latte);
const logoDark = logo(C.cream, C.brown, C.caramel);

// ── Bannière ──────────────────────────────────────────────────────────────
function banner(w, h) {
	const wisps = [0.3, 0.5, 0.7]
		.map((f, i) => {
			const x = w * f;
			return `<path d="M${x} ${h} c-80 -${h * 0.2} 80 -${h * 0.3} 0 -${h * 0.5} s80 -${h * 0.3} 0 -${h * 0.5}" fill="none" stroke="${C.cream}" stroke-width="${18 - i * 4}" stroke-linecap="round" opacity="0.10"/>`;
		})
		.join("");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, C.espresso, C.brown, "#c8986b")}
		${beans(w, h, 26, 7)}
		${wisps}
	</svg>`;
}

// ── Couverture : Bienvenue au labo (fiole + tasse) ────────────────────────
function coverWelcome(w = 1600, h = 900) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, C.espresso, C.brown, C.caramel)}
		${beans(w, h, 22, 11)}
		<!-- Fiole d'Erlenmeyer remplie de café -->
		<g transform="translate(780 180)">
			<path d="M90 0h100v170l120 260a40 40 0 0 1-36 56H6a40 40 0 0 1-36-56l120-260z" fill="${C.cream}" opacity="0.18" stroke="${C.cream}" stroke-width="10" stroke-linejoin="round"/>
			<path d="M28 330h224l46 100a26 26 0 0 1-24 38H6a26 26 0 0 1-24-38z" fill="${C.espresso}"/>
			<path d="M28 330h224" stroke="${C.latte}" stroke-width="10"/>
			<rect x="76" y="-20" width="128" height="30" rx="12" fill="${C.cream}"/>
			<circle cx="110" cy="260" r="14" fill="${C.latte}" opacity="0.7"/>
			<circle cx="160" cy="220" r="9" fill="${C.latte}" opacity="0.6"/>
			<circle cx="140" cy="180" r="6" fill="${C.latte}" opacity="0.5"/>
		</g>
		<!-- Tasse -->
		<g transform="translate(560 470)">
			<ellipse cx="130" cy="210" rx="190" ry="34" fill="${C.espresso}" opacity="0.45"/>
			<path d="M0 40h260v80a130 130 0 0 1-260 0z" fill="${C.cream}"/>
			<path d="M260 64h24a48 48 0 0 1 0 96h-34" fill="none" stroke="${C.cream}" stroke-width="22" stroke-linecap="round"/>
			<ellipse cx="130" cy="40" rx="130" ry="22" fill="${C.brown}"/>
			${steam(130, 0, 140, C.cream, 0.55)}
		</g>
	</svg>`;
}

// ── Couverture : Espresso (tasse vue de côté + crema) ─────────────────────
function coverEspresso(w = 1600, h = 900) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, "#1d110b", C.espresso, C.brown)}
		${beans(w, h, 18, 23)}
		<g transform="translate(650 290)">
			<!-- Soucoupe -->
			<ellipse cx="150" cy="330" rx="260" ry="48" fill="${C.cream}"/>
			<ellipse cx="150" cy="322" rx="200" ry="30" fill="${C.oat}"/>
			<!-- Tasse -->
			<path d="M0 60h300l-20 180a70 70 0 0 1-70 60H90a70 70 0 0 1-70-60z" fill="${C.cream}"/>
			<path d="M296 100h30a52 52 0 0 1 0 104h-46" fill="none" stroke="${C.cream}" stroke-width="24" stroke-linecap="round"/>
			<!-- Crema -->
			<ellipse cx="150" cy="60" rx="150" ry="28" fill="${C.caramel}"/>
			<ellipse cx="150" cy="62" rx="118" ry="19" fill="${C.latte}" opacity="0.65"/>
			<path d="M90 62q60-14 120 0" fill="none" stroke="${C.cream}" stroke-width="5" opacity="0.6"/>
			${steam(150, 10, 220, C.cream, 0.4, 12)}
		</g>
	</svg>`;
}

// ── Couverture : Matcha latte (verre en couches) ──────────────────────────
function coverMatcha(w = 1600, h = 900) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		<defs>
			<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#3a4a26"/><stop offset="0.6" stop-color="${C.matcha}"/><stop offset="1" stop-color="${C.matchaLight}"/>
			</linearGradient>
			<linearGradient id="drink" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="${C.oat}"/>
				<stop offset="0.45" stop-color="#d8e2bf"/>
				<stop offset="0.62" stop-color="${C.matchaLight}"/>
				<stop offset="1" stop-color="${C.matcha}"/>
			</linearGradient>
		</defs>
		<rect width="${w}" height="${h}" fill="url(#bg)"/>
		<!-- Feuilles -->
		${[
			[180, 140, 30],
			[1440, 760, -40],
			[1500, 160, 120],
			[260, 780, 200],
		]
			.map(
				([x, y, a]) =>
					`<g transform="translate(${x} ${y}) rotate(${a})" opacity="0.22"><path d="M0 0c40-60 120-60 160 0c-40 60-120 60-160 0z" fill="${C.oat}"/><path d="M0 0h160" stroke="#3a4a26" stroke-width="4"/></g>`,
			)
			.join("")}
		<!-- Verre -->
		<g transform="translate(725 160)">
			<ellipse cx="160" cy="590" rx="200" ry="30" fill="#2c3a1c" opacity="0.35"/>
			<path d="M0 0h320l-34 560a30 30 0 0 1-30 28H64a30 30 0 0 1-30-28z" fill="${C.cream}" opacity="0.22"/>
			<path d="M14 120h292l-26 436a24 24 0 0 1-24 22H64a24 24 0 0 1-24-22z" fill="url(#drink)"/>
			<ellipse cx="160" cy="120" rx="146" ry="18" fill="${C.oat}"/>
			<path d="M0 0h320l-34 560a30 30 0 0 1-30 28H64a30 30 0 0 1-30-28z" fill="none" stroke="${C.cream}" stroke-width="10" stroke-linejoin="round"/>
			<path d="M40 40l26 470" stroke="${C.cream}" stroke-width="12" stroke-linecap="round" opacity="0.4"/>
		</g>
		<!-- Chasen (fouet) -->
		<g transform="translate(555 690) rotate(-18)" opacity="0.9">
			<rect x="-26" y="-180" width="52" height="120" rx="20" fill="${C.oat}"/>
			${Array.from({ length: 9 }, (_, i) => `<path d="M${-24 + i * 6} -60q${(i - 4) * 9} 90 ${(i - 4) * 14} 150" fill="none" stroke="${C.oat}" stroke-width="5"/>`).join("")}
		</g>
	</svg>`;
}

// ── Couverture projet : Dany's Lab (fenêtre de navigateur) ────────────────
function coverProjectSite(w = 1600, h = 900) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, C.espresso, C.brown, C.caramel)}
		${beans(w, h, 20, 31)}
		<g transform="translate(220 130)">
			<rect width="1160" height="660" rx="36" fill="${C.cream}"/>
			<rect width="1160" height="80" rx="36" fill="${C.oat}"/>
			<rect y="44" width="1160" height="36" fill="${C.oat}"/>
			${[0, 1, 2].map((i) => `<circle cx="${50 + i * 40}" cy="40" r="13" fill="${[C.caramel, C.latte, C.matcha][i]}"/>`).join("")}
			<rect x="180" y="20" width="720" height="40" rx="20" fill="${C.cream}"/>
			<text x="210" y="49" font-family="${SANS}" font-size="24" fill="${C.brown}">wyvernne.github.io/danys-lab</text>
			<!-- Bannière miniature -->
			<rect x="30" y="100" width="1100" height="230" rx="20" fill="${C.brown}"/>
			<text x="580" y="235" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="76" fill="${C.cream}">Dany’s Lab</text>
			<!-- Colonne profil -->
			<rect x="30" y="350" width="260" height="280" rx="20" fill="${C.oat}"/>
			<g transform="translate(95 370) scale(0.25)">${logoLight.replace(/<\/?svg[^>]*>/g, "")}</g>
			<rect x="80" y="520" width="160" height="18" rx="9" fill="${C.latte}"/>
			<rect x="60" y="555" width="200" height="12" rx="6" fill="${C.latte}" opacity="0.6"/>
			<!-- Cartes d'articles -->
			${[0, 1, 2]
				.map(
					(i) => `<rect x="310" y="${350 + i * 96}" width="820" height="80" rx="18" fill="${C.oat}"/>
				<rect x="335" y="${370 + i * 96}" width="${320 - i * 60}" height="18" rx="9" fill="${C.brown}"/>
				<rect x="335" y="${400 + i * 96}" width="${500 - i * 40}" height="12" rx="6" fill="${C.latte}"/>
				<rect x="1020" y="${360 + i * 96}" width="96" height="60" rx="12" fill="${[C.caramel, C.espresso, C.matcha][i]}"/>`,
				)
				.join("")}
		</g>
	</svg>`;
}

// ── Couverture projet : Labo café (fiche recette) ─────────────────────────
function coverProjectRecipes(w = 1600, h = 900) {
	const lines = (x, y, n) =>
		Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 42}" width="${300 - (i % 3) * 50}" height="14" rx="7" fill="${C.latte}"/>`).join("");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, "#1d110b", C.espresso, C.brown)}
		${beans(w, h, 26, 47)}
		<!-- Fiches empilées -->
		<g transform="translate(520 150) rotate(-7)">
			<rect width="560" height="640" rx="30" fill="${C.matchaLight}"/>
		</g>
		<g transform="translate(520 130) rotate(4)">
			<rect width="560" height="640" rx="30" fill="${C.cream}"/>
			<text x="50" y="100" font-family="${SANS}" font-weight="700" font-size="54" fill="${C.espresso}">Espresso</text>
			<text x="50" y="150" font-family="${SANS}" font-size="28" fill="${C.caramel}">ratio 1:2 · 93 °C</text>
			<line x1="50" y1="185" x2="510" y2="185" stroke="${C.latte}" stroke-width="4" stroke-dasharray="12 10"/>
			${["18 g café", "36 g eau", "~28 s"].map((t, i) => `<circle cx="70" cy="${240 + i * 56}" r="10" fill="${C.caramel}"/><text x="96" y="${250 + i * 56}" font-family="${SANS}" font-size="32" fill="${C.brown}">${t}</text>`).join("")}
			${lines(50, 430, 4)}
			<g transform="translate(400 470)">
				<path d="M0 30h100v30a50 50 0 0 1-100 0z" fill="${C.brown}"/>
				<path d="M100 40h10a20 20 0 0 1 0 40h-14" fill="none" stroke="${C.brown}" stroke-width="10" stroke-linecap="round"/>
				${steam(50, 18, 70, C.caramel, 0.7, 6, 18)}
			</g>
		</g>
	</svg>`;
}

// ── Image de partage (réseaux sociaux) 1200×630 ───────────────────────────
function ogImage(w = 1200, h = 630) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
		${gradientBg(w, h, C.espresso, C.brown, "#c8986b")}
		${beans(w, h, 20, 59)}
		<g transform="translate(90 155) scale(0.62)">${logoLight.replace(/<\/?svg[^>]*>/g, "")}</g>
		<text x="460" y="300" font-family="${SANS}" font-weight="700" font-size="104" fill="${C.cream}">Dany’s Lab</text>
		<text x="464" y="372" font-family="${SANS}" font-size="38" fill="${C.cream}" opacity="0.85">Portfolio, projets et labo café</text>
		<text x="464" y="440" font-family="${SANS}" font-size="28" fill="${C.latte}">wyvernne.github.io/danys-lab</text>
	</svg>`;
}

// ── Génération ────────────────────────────────────────────────────────────
await save(logoLight, "public/logo/icon.webp", { width: 512, height: 512 });
await save(logoLight, "shirones/assets/avatar.webp", { width: 512, height: 512 });
for (const size of [32, 128, 180, 192]) {
	await save(logoLight, `public/favicon/favicon-light-${size}.png`, { width: size, height: size, format: "png" });
	await save(logoDark, `public/favicon/favicon-dark-${size}.png`, { width: size, height: size, format: "png" });
}
await save(banner(2560, 1440), "shirones/assets/banner/desktop.webp");
await save(banner(1080, 1920), "shirones/assets/banner/mobile.webp");

await save(coverWelcome(), "shirones/content/fr/posts/bienvenue/cover.webp");
await save(coverEspresso(), "shirones/recipes/fr/espresso.webp");
await save(coverMatcha(), "shirones/recipes/fr/matcha-latte.webp");

await save(coverProjectSite(), "public/images/projects/danys-lab.webp");
await save(coverProjectRecipes(), "public/images/projects/labo-cafe.webp");

await save(ogImage(), "public/images/og.jpg", { format: "jpg" });
