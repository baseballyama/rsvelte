import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0,
		doubled = $.derived(() => count * 2);

	let quadrupled = $.derived(() => doubled() * 2);

	$$renderer.push(`<button>increment</button> <p>count: ${$.escape(count)}</p> <p>doubled: ${$.escape(doubled())}</p> <p>quadrupled: ${$.escape(quadrupled())}</p>`);
}