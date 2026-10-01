import { error, json } from '@sveltejs/kit';
import { allModules } from '$lib/server/source';

/** One module's items with highlighted code, for the reference page's code viewer. */
export const GET = ({ params: parameters }) => {
	const m = allModules().find((x) => x.key === parameters.module);
	if (!m) error(404, `no module ${parameters.module}`);
	return json(
		{ key: m.key, path: m.path, items: m.items.map(({ key, name, kind, startLine, endLine, markup }) => ({ key, name, kind, startLine, endLine, markup })) },
		{ headers: { 'cache-control': 'public, max-age=3600' } }
	);
};
