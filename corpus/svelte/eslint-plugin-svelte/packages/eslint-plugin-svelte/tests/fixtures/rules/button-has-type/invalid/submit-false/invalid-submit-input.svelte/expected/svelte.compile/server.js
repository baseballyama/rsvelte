import * as $ from 'svelte/internal/server';

export default function Invalid_submit_input($$renderer) {
	$$renderer.push(`<button type="submit">Hello World</button>`);
}