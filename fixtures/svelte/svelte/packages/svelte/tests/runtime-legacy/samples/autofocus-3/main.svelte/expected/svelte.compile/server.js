import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div><input autofocus=""/></div>`);
}