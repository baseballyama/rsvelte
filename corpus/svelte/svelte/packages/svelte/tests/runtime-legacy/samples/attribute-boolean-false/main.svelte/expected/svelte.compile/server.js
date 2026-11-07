import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<textarea${$.attr('readonly', false, true)}></textarea>`);
}