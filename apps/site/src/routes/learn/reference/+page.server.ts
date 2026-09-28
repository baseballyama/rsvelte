import { allModules } from '$lib/server/source';

export const load = () => ({
	modules: allModules().map((m) => ({
		key: m.key,
		path: m.path,
		lines: m.lines,
		items: m.items
			.filter((i) => !i.name.startsWith('tests'))
			.map((i) => ({ key: i.key, name: i.name, kind: i.kind, startLine: i.startLine, endLine: i.endLine, doc: i.docs.split('\n')[0] }))
	}))
});
