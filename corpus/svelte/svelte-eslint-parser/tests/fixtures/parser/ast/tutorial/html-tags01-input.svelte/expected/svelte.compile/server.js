import * as $ from 'svelte/internal/server';

export default function Html_tags01_input($$renderer) {
	let string = `this string contains some <strong>HTML!!!</strong>`;

	$$renderer.push(`<p>this string contains some &lt;strong>HTML!!!&lt;/strong></p>`);
}