import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { html } = $$props;

	$$renderer.push(`${$.html(html)}`);
}