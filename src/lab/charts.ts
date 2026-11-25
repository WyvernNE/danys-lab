/**
 * Petits graphiques SVG générés au build (aucun JavaScript côté navigateur).
 * Les couleurs suivent le thème via les variables CSS de Material 3.
 */

const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Radar des critères de l'Indice confort (3 critères minimum). */
export function radarSvg(criteria: Record<string, number>, label: string): string {
	const entries = Object.entries(criteria);
	if (entries.length < 3) return "";
	const size = 260;
	const c = size / 2;
	const r = 78;
	const angle = (i: number) => (Math.PI * 2 * i) / entries.length - Math.PI / 2;
	const point = (i: number, v: number) => {
		const a = angle(i);
		return [c + Math.cos(a) * r * (v / 10), c + Math.sin(a) * r * (v / 10)];
	};
	const rings = [2.5, 5, 7.5, 10]
		.map((v) => {
			const pts = entries.map((_, i) => point(i, v).join(",")).join(" ");
			return `<polygon points="${pts}" fill="none" stroke="var(--outline-variant)" stroke-width="1"/>`;
		})
		.join("");
	const axes = entries
		.map((_, i) => {
			const [x, y] = point(i, 10);
			return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="var(--outline-variant)" stroke-width="1"/>`;
		})
		.join("");
	const shape = entries.map(([, v], i) => point(i, v).join(",")).join(" ");
	const dots = entries
		.map(([, v], i) => {
			const [x, y] = point(i, v);
			return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--primary)"/>`;
		})
		.join("");
	const labels = entries
		.map(([name, v], i) => {
			const [x, y] = point(i, 12.6);
			const anchor = Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end";
			return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="lab-radar__label">${esc(name)} <tspan class="lab-radar__value">${v}</tspan></text>`;
		})
		.join("");
	return `<svg class="lab-radar" viewBox="-60 0 ${size + 120} ${size}" role="img" aria-label="${esc(label)}">${rings}${axes}<polygon points="${shape}" fill="var(--primary)" fill-opacity="0.18" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}

/** Barres horizontales simples : [{ label, value }]. */
export function barsSvg(rows: { label: string; value: number }[], max?: number): string {
	if (!rows.length) return "";
	const top = max ?? Math.max(...rows.map((r) => r.value), 1);
	const rowH = 34;
	const labelW = 110;
	const barW = 300;
	const h = rows.length * rowH;
	const bars = rows
		.map((row, i) => {
			const y = i * rowH;
			const w = Math.max((row.value / top) * barW, row.value > 0 ? 4 : 0);
			return `<g transform="translate(0 ${y})">
<text x="0" y="17" dominant-baseline="middle" class="lab-chart__label">${esc(row.label)}</text>
<rect x="${labelW}" y="6" width="${barW}" height="22" rx="6" fill="var(--surface-container-high)"/>
<rect x="${labelW}" y="6" width="${w}" height="22" rx="6" fill="var(--primary)"/>
<text x="${labelW + barW + 10}" y="17" dominant-baseline="middle" class="lab-chart__value">${row.value}</text>
</g>`;
		})
		.join("");
	return `<svg class="lab-chart" viewBox="0 0 ${labelW + barW + 50} ${h}" role="img">${bars}</svg>`;
}

/** Colonnes verticales de scores sur 10 : [{ label, value, display? }]. */
export function columnsSvg(rows: { label: string; value: number; display?: string }[]): string {
	if (!rows.length) return "";
	const colW = 44;
	const gap = 14;
	const chartH = 150;
	// Largeur minimale : quelques colonnes restent fines au lieu d'être étirées.
	const w = Math.max(rows.length * (colW + gap) + gap, 560);
	const cols = rows
		.map((row, i) => {
			const x = gap + i * (colW + gap);
			const hBar = (row.value / 10) * chartH;
			return `<g>
<rect x="${x}" y="${20 + chartH - hBar}" width="${colW}" height="${hBar}" rx="6" fill="var(--primary)"/>
<text x="${x + colW / 2}" y="${12 + chartH - hBar}" text-anchor="middle" class="lab-chart__value">${esc(row.display ?? String(row.value))}</text>
<text x="${x + colW / 2}" y="${chartH + 38}" text-anchor="middle" class="lab-chart__label">${esc(row.label)}</text>
</g>`;
		})
		.join("");
	const grid = [0, 5, 10]
		.map((v) => {
			const y = 20 + chartH - (v / 10) * chartH;
			return `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="var(--outline-variant)" stroke-dasharray="3 4"/>`;
		})
		.join("");
	return `<svg class="lab-chart" viewBox="0 0 ${w} ${chartH + 50}" role="img">${grid}${cols}</svg>`;
}
