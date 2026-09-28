import * as $ from 'svelte/internal/server';

export default function Native($$renderer) {
	$$renderer.push(`<progress class="progress" value="50" max="100"></progress>`);
}