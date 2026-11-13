// 75 -> "1 h 15 min", 45 -> "45 min", 120 -> "2 h"
export function formatMinutes(minutes?: number): string | null {
	if (minutes == null) return null;
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// Split into quantity/name so the quantity can be styled separately
// (cooked.wiki bolds it — "1 package dry yeast").
export function ingredientParts(ingredient: { name: string; amount?: number | string; unit?: string }): {
	quantity: string | null;
	name: string;
} {
	const quantity = [ingredient.amount, ingredient.unit].filter((p) => p !== undefined && p !== '').join(' ');
	return { quantity: quantity || null, name: ingredient.name };
}

// --- Servings scaling ----------------------------------------------------
// Shared by the build (to tag each amount with its numeric value) and the
// client script (to re-render amounts when the servings stepper changes),
// so nothing in here may import from astro:content.

const UNICODE_FRACTIONS: Record<string, number> = {
	'½': 1 / 2,
	'⅓': 1 / 3,
	'⅔': 2 / 3,
	'¼': 1 / 4,
	'¾': 3 / 4,
	'⅕': 1 / 5,
	'⅛': 1 / 8,
	'⅜': 3 / 8,
	'⅝': 5 / 8,
	'⅞': 7 / 8,
};

// 3 -> 3, "1,5" -> 1.5, "¾" -> 0.75, "4 ½" -> 4.5, "1 1/2" -> 1.5.
// Anything else ("1 package", "a pinch") -> null, meaning "don't scale".
export function parseAmount(amount?: number | string): number | null {
	if (amount == null) return null;
	if (typeof amount === 'number') return amount;
	const m = amount.trim().match(/^(\d+(?:[.,]\d+)?)?\s*(?:([½⅓⅔¼¾⅕⅛⅜⅝⅞])|(\d+)\/(\d+))?$/);
	if (!m || (!m[1] && !m[2] && !m[3])) return null;
	let value = m[1] ? parseFloat(m[1].replace(',', '.')) : 0;
	if (m[2]) value += UNICODE_FRACTIONS[m[2]];
	if (m[3]) {
		const denominator = parseInt(m[4], 10);
		if (denominator === 0) return null;
		value += parseInt(m[3], 10) / denominator;
	}
	return value;
}

const NICE_FRACTIONS: [number, string][] = [
	[1 / 8, '⅛'],
	[1 / 4, '¼'],
	[1 / 3, '⅓'],
	[1 / 2, '½'],
	[2 / 3, '⅔'],
	[3 / 4, '¾'],
];

// Formats a scaled amount for display. Grams/millilitres become whole
// numbers (rounded to 5 above 50, so 2× of 90 g reads "180 g" and ⅓× of
// 200 g reads "65 g", not "66.67 g"); everything else gets kitchen
// fractions where one is close, else one decimal.
export function formatAmount(value: number, unit?: string): string {
	if (unit && /^(g|ml|mg)$/i.test(unit.trim())) {
		if (value >= 50) return String(Math.round(value / 5) * 5);
		if (value >= 10) return String(Math.round(value));
	}
	const whole = Math.floor(value);
	const rest = value - whole;
	// Tiny amounts (a pinch of a scaled-down ½ tsp) keep two decimals
	// rather than collapsing to "0".
	if (whole === 0 && rest < 0.09) return String(Math.max(0.01, Math.round(value * 100) / 100));
	if (rest < 0.04) return String(whole);
	if (rest > 0.96) return String(whole + 1);
	for (const [fraction, glyph] of NICE_FRACTIONS) {
		if (Math.abs(rest - fraction) < 0.04) return whole === 0 ? glyph : `${whole}${glyph}`;
	}
	return String(Math.round(value * 10) / 10);
}

// --- Timers ----------------------------------------------------------------

export interface DurationMatch {
	index: number;
	text: string;
	// Lower bound of a range ("18-20 minutes" -> 18 min), in seconds — the
	// timer goes off at the earliest point it's worth checking.
	seconds: number;
}

const UNIT_SECONDS: [RegExp, number][] = [
	[/^(hours?|hrs?|h|timer|time|hodiny|hodina|hodinu|hodin|hod)$/i, 3600],
	[/^(minutes?|minutter|minuty|minuta|minutu|minut|mins?)$/i, 60],
	[/^(seconds?|secs?|sekunder|sekundy|sekunda|sekund|sek)$/i, 1],
];

// English, Danish and Czech units ("2 timer" is two hours in Danish,
// "1,5 hodiny" one and a half in Czech). Longer spellings come first so the
// alternation doesn't stop at a prefix.
const DURATION_RE =
	/(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|to|til|až)\s*(\d+(?:[.,]\d+)?))?\s*(hours?|hrs?|hodiny|hodina|hodinu|hodin|hod|h|timer|time|minutter|minutes?|minuty|minuta|minutu|minut|mins?|seconds?|secs?|sekunder|sekundy|sekunda|sekund|sek)\b/gi;

// Finds durations like "15 minutes", "1.5-2 hours", "18–20 min" in step text.
export function findDurations(text: string): DurationMatch[] {
	const matches: DurationMatch[] = [];
	for (const m of text.matchAll(DURATION_RE)) {
		const unit = UNIT_SECONDS.find(([re]) => re.test(m[3]));
		if (!unit) continue;
		const seconds = Math.round(parseFloat(m[1].replace(',', '.')) * unit[1]);
		if (seconds <= 0) continue;
		matches.push({ index: m.index!, text: m[0], seconds });
	}
	return matches;
}

// --- Pantry items ------------------------------------------------------------

export interface PantryItem {
	id: string;
	data: { name: string; names: Partial<Record<string, string>>; aliases: string[] };
}

const normalize = (s: string) => s.trim().toLowerCase();

// An ingredient's `item` id wins; otherwise its name is matched against each
// item's name, its names in every language, and its aliases.
export function findItem<T extends PantryItem>(
	ingredient: { name: string; item?: string },
	items: T[]
): T | undefined {
	if (ingredient.item) return items.find((i) => i.id === ingredient.item);
	const name = normalize(ingredient.name);
	return items.find((i) =>
		[i.data.name, ...Object.values(i.data.names), ...i.data.aliases].some((n) => n != null && normalize(n) === name)
	);
}

// Puts entries for `city` first, then other cities alphabetically, then
// entries with no city ("anywhere"). Stable within a city.
export function sortByCity<T extends { city?: string }>(entries: T[], city: string): T[] {
	const rank = (e: T) => (e.city === city ? 0 : e.city ? 1 : 2);
	return [...entries].sort((a, b) => rank(a) - rank(b) || (a.city ?? '').localeCompare(b.city ?? ''));
}

// --- JSON-LD helpers ------------------------------------------------------------

// 75 -> "PT1H15M"
export function isoDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `PT${h ? `${h}H` : ''}${m || !h ? `${m}M` : ''}`;
}

// Pulls the ordered-list steps out of a recipe's markdown body as plain text.
export function extractSteps(body: string | undefined): string[] {
	if (!body) return [];
	return body
		.split('\n')
		.map((line) => line.match(/^\s*\d+\.\s+(.*)$/)?.[1])
		.filter((s): s is string => !!s)
		.map((s) =>
			s
				.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
				.replace(/(\*\*|__|\*|_|`)/g, '')
				.trim()
		);
}
