import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { name } = $$props;

	$$renderer.push(`<p>name: ${$.escape(name)}</p>`);
}