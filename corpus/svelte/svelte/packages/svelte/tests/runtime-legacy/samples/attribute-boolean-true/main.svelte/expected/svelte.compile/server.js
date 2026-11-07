import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<textarea${$.attr('readonly', true, true)}${$.attr('data-attr', true)}></textarea>`);
}