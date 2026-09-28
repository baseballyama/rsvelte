import * as $ from 'svelte/internal/server';
import Inner from './inner.svelte';

export default function Main($$renderer) {
	Inner($$renderer, { content: '<p>invalid</p>' });
	$$renderer.push(`<!----> <p>${$.html('<p>invalid</p>')}</p>`);
}