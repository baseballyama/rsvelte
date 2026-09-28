import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<a href="mailto:hello@example.com">email</a>`);
}