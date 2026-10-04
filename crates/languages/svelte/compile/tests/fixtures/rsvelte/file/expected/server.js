import * as $ from 'svelte/internal/server';

export default function File($$renderer, $$props) {
	let { header } = $$props;
	$$renderer.push(`<p>${$.escape(header ? 'with header' : 'no header')}</p>`);
}
