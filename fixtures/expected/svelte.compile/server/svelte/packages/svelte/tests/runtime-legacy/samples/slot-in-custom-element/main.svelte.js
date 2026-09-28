import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<custom-element><header slot="header">header header header</header></custom-element>`);
}