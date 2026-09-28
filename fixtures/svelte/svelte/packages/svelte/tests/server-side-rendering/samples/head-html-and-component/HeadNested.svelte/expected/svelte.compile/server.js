import * as $ from 'svelte/internal/server';

export default function HeadNested($$renderer) {
	$$renderer.push(`${$.html('<meta name="head_nested_html" content="head_nested_html">')} <meta name="head_nested" content="head_nested"/>`);
}