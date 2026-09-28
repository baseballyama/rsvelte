import * as $ from 'svelte/internal/server';

export default function HelloWorld($$renderer) {
	$$renderer.push(`<div>Hello world</div>`);
}