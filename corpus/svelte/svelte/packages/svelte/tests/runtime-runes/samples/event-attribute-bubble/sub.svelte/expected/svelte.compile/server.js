import * as $ from 'svelte/internal/server';

export default function Sub($$renderer, $$props) {
	const { onclick, increment, count } = $$props;

	$$renderer.push(`<button>${$.escape(count)}</button> <button>${$.escape(count)}</button>`);
}