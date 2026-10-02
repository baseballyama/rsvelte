import * as $ from 'svelte/internal/server';

export default function Hello($$renderer) {
	$$renderer.push(`<h1>Hello world!</h1>`);
}
