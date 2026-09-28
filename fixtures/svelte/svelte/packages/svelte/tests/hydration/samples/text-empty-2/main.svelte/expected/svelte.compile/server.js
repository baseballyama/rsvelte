import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { name, remaining } = $$props;

	$$renderer.push(`<span><span>${$.escape(name)}</span>${$.escape(remaining >= 2 ? ',' : '')}</span>`);
}