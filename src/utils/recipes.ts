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
