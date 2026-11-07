import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = $.derived(() => ({ value: 1 }));

	$$renderer.push(`<button>mutate</button> <button>assign self</button> <button>assign copy</button> <div>${$.escape(count().value)}</div>`);
}