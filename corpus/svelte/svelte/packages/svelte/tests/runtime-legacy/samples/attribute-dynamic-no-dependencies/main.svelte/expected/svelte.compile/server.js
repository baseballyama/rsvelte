import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div><div title="foo">bar</div></div>`);
}