import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const abc = 'abc';

	$$renderer.push(`<div aria-checked="yes"></div> <div aria-checked="no"></div> <div${$.attr('aria-checked', 1234)}></div> <div${$.attr('aria-checked', `${abc}`)}></div>`);
}