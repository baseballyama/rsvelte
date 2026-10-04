import * as $ from 'svelte/internal/server';

export default function Options_custom_host($$renderer, $$props) {
	let {} = $$props;
	let host = void 0;
	$$renderer.push(`<p>${$.escape(host)}</p>`);
}
