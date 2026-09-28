import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>&lt;marquee>hello&lt;/marquee></p>`);
}