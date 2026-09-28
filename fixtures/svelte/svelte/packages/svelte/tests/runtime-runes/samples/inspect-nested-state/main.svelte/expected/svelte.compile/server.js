import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = { count: 0 };

	;;
	$$renderer.push(`<button>${$.escape(x.count)}</button>`);
}