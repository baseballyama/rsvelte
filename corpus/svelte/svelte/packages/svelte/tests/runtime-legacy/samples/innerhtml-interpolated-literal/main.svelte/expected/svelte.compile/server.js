import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div><span class="a/42"></span></div>`);
}