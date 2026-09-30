import * as $ from 'svelte/internal/server';

export default function Styled_svue($$renderer) {
	let size = 'big';

	$$renderer.push(`<p class="big svelte-59lghn"${$.attr('data-size', size)}>text</p> <span class="svelte-59lghn">plain</span>`);
}