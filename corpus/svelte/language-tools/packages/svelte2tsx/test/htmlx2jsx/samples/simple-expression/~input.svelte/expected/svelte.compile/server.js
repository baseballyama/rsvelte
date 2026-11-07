import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1>Hello ${$.escape(name)}</h1>`);
}