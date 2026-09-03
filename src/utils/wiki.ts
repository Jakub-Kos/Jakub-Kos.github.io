import type { CollectionEntry } from 'astro:content';

// Single source of truth for how each entry `type` is labelled and coloured,
// shared between WikiLayout, the wiki index, and the knowledge graph.
export const TYPE_META: Record<string, { label: string; color: string }> = {
	note: { label: 'Note', color: '#64748b' },
	subject: { label: 'Subject', color: '#2563eb' },
	chapter: { label: 'Chapter', color: '#16a34a' },
	talk: { label: 'Talk', color: '#9333ea' },
	video: { label: 'Video', color: '#dc2626' },
	project: { label: 'Project', color: '#ea580c' },
	thesis: { label: 'Thesis', color: '#0f172a' },
	reference: { label: 'Reference', color: '#0891b2' },
	log: { label: 'Log', color: '#65a30d' },
};

export function typeMeta(type: string) {
	return TYPE_META[type] ?? TYPE_META.note;
}

// Every ancestor folder of an entry id, shallowest first.
// "university/erasmus/itu/algorithms/complexity" ->
//   ["university", "university/erasmus", "university/erasmus/itu", "university/erasmus/itu/algorithms"]
export function getAncestorFolders(id: string): string[] {
	const parts = id.split('/').slice(0, -1);
	const folders: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		folders.push(parts.slice(0, i + 1).join('/'));
	}
	return folders;
}

// The immediate parent folder of an entry id, or '' if it's at the root.
export function parentFolder(id: string): string {
	const parts = id.split('/');
	return parts.slice(0, -1).join('/');
}

// "itu-copenhagen" -> "Itu Copenhagen"
export function folderLabel(path: string): string {
	const last = path.split('/').pop() ?? path;
	return last
		.split(/[-_]/)
		.map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
		.join(' ');
}

// Pages sharing the same immediate parent folder as `entry`, excluding itself.
export function siblingsOf(entry: CollectionEntry<'wiki'>, all: CollectionEntry<'wiki'>[]) {
	const folder = parentFolder(entry.id);
	if (!folder) return [];
	return all
		.filter((e) => e.id !== entry.id && parentFolder(e.id) === folder)
		.sort((a, b) => a.data.title.localeCompare(b.data.title));
}
