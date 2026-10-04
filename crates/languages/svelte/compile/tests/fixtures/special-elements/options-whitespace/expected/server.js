import * as $ from 'svelte/internal/server';

export default function Options_whitespace($$renderer) {
	$$renderer.push(`<div>  hello   world  </div>`);
}
