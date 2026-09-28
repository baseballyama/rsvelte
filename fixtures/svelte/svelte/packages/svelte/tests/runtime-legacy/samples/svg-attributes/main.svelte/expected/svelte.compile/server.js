import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg><g><circle class="red"></circle></g></svg>`);
}