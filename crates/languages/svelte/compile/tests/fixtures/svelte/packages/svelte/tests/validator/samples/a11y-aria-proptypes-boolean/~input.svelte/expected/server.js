import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const abc = 'abc';

	$$renderer.push(`<button aria-disabled="yes">click me</button> <button aria-disabled="no">click me</button> <button${$.attr('aria-disabled', 1234)}>click me</button> <button${$.attr('aria-disabled', `${abc}`)}>click me</button>`);
}