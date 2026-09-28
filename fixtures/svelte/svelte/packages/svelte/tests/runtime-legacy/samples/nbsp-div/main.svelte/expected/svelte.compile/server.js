import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = 'hello';

	$$renderer.push(`<div> hello</div> <div> hello  </div> <div> hello   hello</div>`);
}