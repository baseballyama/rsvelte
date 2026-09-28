import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<table class="abc"><tbody><tr><td>Hello world</td></tr></tbody></table>`);
}