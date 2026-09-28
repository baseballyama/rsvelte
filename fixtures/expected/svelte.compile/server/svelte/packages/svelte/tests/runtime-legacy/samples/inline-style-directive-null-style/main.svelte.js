import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p${$.attr_style(null, { color: 'red' })}>red</p>`);
}