import * as $ from 'svelte/internal/server';

export default function Boundary_reactive($$renderer) {
	let onerror = () => {};
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<p>Hello</p>`);
	}
	$$renderer.push(`<!--]-->`);
	$$renderer.push(`<button>change</button>`);
}
