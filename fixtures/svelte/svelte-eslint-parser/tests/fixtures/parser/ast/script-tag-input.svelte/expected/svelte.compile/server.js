import * as $ from 'svelte/internal/server';

export default function Script_tag_input($$renderer) {
	$$renderer.push(`<head>`);
	$$renderer.push(`<script type="text/javascript" id="" src="/some-script.js"></script>`);
	$$renderer.push(` <link href="/style.css" rel="stylesheet"/> `);
	$$renderer.push(`<script>console.log('foo')</script>`);
	$$renderer.push(`</head>`);
}