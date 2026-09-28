import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg>${$.html('<circle cx="200" cy="500" r="200"></circle>')}</svg>`);
}