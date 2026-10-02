import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<foo-bar>Hello</foo-bar>`);
}