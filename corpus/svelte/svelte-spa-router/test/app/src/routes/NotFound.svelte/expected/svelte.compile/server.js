import * as $ from 'svelte/internal/server';

export default function NotFound($$renderer) {
	$$renderer.push(`<h2 class="routetitle">NotFound</h2> <p>Oops, this route doesn't exist!</p>`);
}