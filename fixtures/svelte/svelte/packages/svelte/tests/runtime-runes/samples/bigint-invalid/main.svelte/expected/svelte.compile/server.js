import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	var invalid = BigInt('invalid');

	$$renderer.push(`<h1>${$.escape(invalid)}</h1>`);
}