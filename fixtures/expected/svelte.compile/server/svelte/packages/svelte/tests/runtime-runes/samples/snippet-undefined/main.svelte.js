import * as $ from 'svelte/internal/server';

function counter($$renderer) {
	$$renderer.push(`<!---->Test`);
}

export default function Main($$renderer) {
	let state = { value: counter };

	state.value($$renderer);
	$$renderer.push(`<!----> <button>change</button>`);
}