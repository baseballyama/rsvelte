import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';

export default function Child($$renderer) {
	// Not read before the outro, by which time the derived is destroyed
	let duration = $.derived(() => 10);

	$$renderer.push(`<div>hello</div>`);
}