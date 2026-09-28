import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let color = 'red';
	const getColor = () => color;

	$$renderer.push(`<div${$.attr_style(`background-color: ${$.stringify(getColor())};`)}>Hello world</div> <button>Make blue</button>`);
}