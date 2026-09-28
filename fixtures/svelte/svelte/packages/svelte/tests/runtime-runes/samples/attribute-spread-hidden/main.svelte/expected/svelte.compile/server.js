import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let hidden = true;
	const restProps = { id: '123' };

	$$renderer.push(`<button>toggle hidden</button> <div${$.attributes({ ...restProps, hidden })}>hello world (with spread attrs)</div>`);
}