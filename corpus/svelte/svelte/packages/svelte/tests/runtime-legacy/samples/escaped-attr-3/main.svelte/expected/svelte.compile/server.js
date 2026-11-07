import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div title="&amp;&lt;">blah</div>`);
}