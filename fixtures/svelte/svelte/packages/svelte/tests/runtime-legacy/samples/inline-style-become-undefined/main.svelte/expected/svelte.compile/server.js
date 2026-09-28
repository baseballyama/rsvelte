import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let bg = "red";

	const handle = () => {
		bg = undefined;
	};

	$$renderer.push(`<div${$.attr_style('', { background: bg })}></div>`);
}