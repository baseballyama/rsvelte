import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input class="wont-focus"/> <input class="will-focus"/>`);
}