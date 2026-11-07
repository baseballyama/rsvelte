import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<textarea readonly=""></textarea> <textarea autocomplete="no"></textarea>`);
}