import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1>Hello <strong>${$.escape(name)}!</strong><span>How are you?</span></h1>`);
}