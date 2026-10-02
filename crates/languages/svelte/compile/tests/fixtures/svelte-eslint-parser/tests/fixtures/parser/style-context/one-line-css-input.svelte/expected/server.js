import * as $ from 'svelte/internal/server';

export default function One_line_css_input($$renderer) {
	let a = 10;

	$$renderer.push(`<span class="myClass svelte-2goq89">Hello!</span>`);
}