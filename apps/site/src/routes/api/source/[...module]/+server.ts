import { error, json } from '@sveltejs/kit';
import { allModules } from '$lib/server/source';

/** One module's items with highlighted code, for the reference page's code viewer. */
export const GET = ({ params }) => {
	const m = allModules().find((x) => x.key === params.module);
	if (!m) error(404, `no module ${params.module}`);
	return json(
		{ key: m.key, path: m.path, items: m.items.map(({ key, name, kind, startLine, endLine, html }) => ({ key, name, kind, startLine, endLine, html })) },
		{ headers: { 'cache-control': 'public, max-age=3600' } }
	);
};
