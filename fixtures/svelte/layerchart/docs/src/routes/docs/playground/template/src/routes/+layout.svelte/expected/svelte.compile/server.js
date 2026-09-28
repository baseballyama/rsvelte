import * as $ from 'svelte/internal/server';
import '../app.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<main class="p-4">`);
	children?.($$renderer);
	$$renderer.push(`<!----></main>`);
}