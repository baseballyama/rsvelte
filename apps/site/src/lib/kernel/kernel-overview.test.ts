import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chaptersIn } from '$lib/site';
import { chapterPositions, overviewEdges, overviewNodes, positionLabel, sharedParts } from './kernel-overview';
import { sources } from '$lib/build/sources';

const chapters = chaptersIn('ja');

const root = path.resolve(import.meta.dirname, '../../../../..');

function lineOf(file: string, line: number) {
	return readFileSync(path.join(root, file), 'utf8').split('\n')[line - 1] ?? '';
}

describe('the overview figure draws only what the code shows', () => {
	it.each([...overviewNodes, ...overviewEdges].map((item) => [('id' in item ? item.id : `${item.from} -> ${item.to}`), item.source] as const))(
		'%s cites a line that holds its code',
		(_, source) => {
			expect(lineOf(source.path, source.line)).toContain(source.text);
		}
	);

	it('draws every kernel module as a node or a shared part', () => {
		const drawn = new Set(['kernel/computation/pipeline', 'kernel/computation/database', 'kernel/computation/plugins', 'kernel/computation/plugins/error', ...sharedParts.map((part) => part.module)]);
		const groups = new Set(['kernel/source', 'kernel/computation', 'kernel/output', 'kernel/performance', 'kernel/diagnostics', 'kernel/lib']);
		const modules = sources(path.join(root, 'crates')).map((source) => source.key)
			.filter((key) => key.startsWith('kernel/') && !groups.has(key) && !/(^|\/)tests(\/|$)/.test(key));
		expect(modules.length).toBeGreaterThan(10);
		expect(modules.filter((key) => !drawn.has(key))).toEqual([]);
	});

	it('connects only nodes that exist', () => {
		const ids = new Set(overviewNodes.map((node) => node.id));
		expect(overviewEdges.filter((edge) => !ids.has(edge.from) || !ids.has(edge.to))).toEqual([]);
	});

	it('lists every shared kernel module the site quotes', () => {
		const modules = new Set(sources(path.join(root, 'crates')).map((source) => source.key));
		expect(sharedParts.filter((part) => !modules.has(part.module))).toEqual([]);
	});
});

describe('chapter positions', () => {
	it('name existing nodes and existing chapters', () => {
		const pages = new Set(chapters.map((chapter) => chapter.href));
		expect(Object.keys(chapterPositions).filter((href) => !pages.has(href))).toEqual([]);
		for (const ids of Object.values(chapterPositions)) for (const id of ids) expect(() => positionLabel(id)).not.toThrow();
	});

	it('light up in the chapter strip, which lists every node', () => {
		const strip = readFileSync(path.join(root, 'apps/site/src/lib/components/ChapterPosition.svelte'), 'utf8');
		expect(overviewNodes.filter((node) => !strip.includes(`'${node.id}'`)).map((node) => node.id)).toEqual([]);
	});

	it('cover every chapter after the overview chapter', () => {
		const after = chapters.slice(chapters.findIndex((chapter) => chapter.slug === 'kernel') + 1);
		expect(after.length).toBeGreaterThan(10);
		expect(after.filter((chapter) => !(chapterPositions[chapter.href]?.length)).map((chapter) => chapter.href)).toEqual([]);
	});

	it('link every node and part to a page of the guide', () => {
		const pages = new Set(['/learn/plugins', ...chapters.map((chapter) => chapter.href)]);
		const links = [...overviewNodes.map((node) => node.href), ...sharedParts.map((part) => part.href)];
		expect(links.filter((href) => !pages.has(href.split('#')[0]))).toEqual([]);
	});

	it('point anchors at sections that exist', () => {
		const anchors = new Set(chapters.flatMap((chapter) => [...chapter.sections.map((section) => `${chapter.href}#${section.id}`), `${chapter.href}#overview`]));
		const links = overviewNodes.map((node) => node.href).filter((href) => href.includes('#'));
		expect(links.length).toBeGreaterThan(0);
		expect(links.filter((href) => !anchors.has(href))).toEqual([]);
	});
});
