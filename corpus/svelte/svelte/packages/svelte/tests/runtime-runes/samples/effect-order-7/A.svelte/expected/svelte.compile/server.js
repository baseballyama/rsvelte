import * as $ from 'svelte/internal/server';
import B from './B.svelte';

export default function A($$renderer, $$props) {
	let { boolean, closed, close } = $$props;

	$$renderer.push(`<span>${$.escape(boolean)} ${$.escape(closed)}</span> `);
	B($$renderer, { closed, close });
	$$renderer.push(`<!---->`);
}