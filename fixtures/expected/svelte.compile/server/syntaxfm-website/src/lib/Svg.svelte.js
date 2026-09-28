import * as $ from 'svelte/internal/server';

export default function Svg($$renderer, $$props) {
	// Pull current specific css var, calculate it's value, pass it as a query param into request.
	// Wave / Grit / Icon
	let { name, fill = 'var(--accent)', stroke } = $$props;

	let img = null;

	$$renderer.push(`<img${$.attr('src', `/svg/${$.stringify(name)}.svg?${fill ? 'f=' + encodeURIComponent(fill) + '&' : ''}${stroke ? 's=' + encodeURIComponent(stroke) : ''}`)}${$.attr('alt', `${$.stringify(name)} icon`)}/>`);
}