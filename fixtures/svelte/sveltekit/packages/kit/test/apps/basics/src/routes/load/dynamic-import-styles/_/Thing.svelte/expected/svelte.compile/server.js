import * as $ from 'svelte/internal/server';

export default function Thing($$renderer) {
	$$renderer.push(`<p id="thing" class="svelte-2wk7c9">this text is red</p>`);
}