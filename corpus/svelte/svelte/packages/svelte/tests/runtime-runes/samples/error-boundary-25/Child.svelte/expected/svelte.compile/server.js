import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	// it's important for the test that this isn't an `Error`
	throw 'child error';

	$$renderer.push(`<p>boom</p>`);
}