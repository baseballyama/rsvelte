import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$$renderer.push(`<p class="foo bar svelte-1ot66wt">red on black</p>`);
}