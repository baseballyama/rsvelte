import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	$$renderer.push(`<style>div { color: red; }</style>`);
	$$renderer.push(` `);
	$$renderer.push(`<script>\`<>\`</script>`);
	$$renderer.push(`</div>`);
}