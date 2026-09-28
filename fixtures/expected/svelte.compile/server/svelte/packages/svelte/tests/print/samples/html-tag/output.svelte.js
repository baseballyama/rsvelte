import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<article>${$.html(content)}</article>`);
}