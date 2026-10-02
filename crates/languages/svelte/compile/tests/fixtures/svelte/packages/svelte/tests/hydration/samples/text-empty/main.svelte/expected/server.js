import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { x } = $$props;

	$$renderer.push(`<!---->${$.escape(x)}`);
}