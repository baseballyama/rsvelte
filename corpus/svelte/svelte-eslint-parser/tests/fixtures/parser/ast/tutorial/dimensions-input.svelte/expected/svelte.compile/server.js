import * as $ from 'svelte/internal/server';

export default function Dimensions_input($$renderer) {
	let w;
	let h;
	let size = 42;
	let text = 'edit me';

	$$renderer.push(`<input type="range"${$.attr('value', size)} class="svelte-1fbbxg7"/> <input${$.attr('value', text)} class="svelte-1fbbxg7"/> <p>size: ${$.escape(w)}px x ${$.escape(h)}px</p> <div class="svelte-1fbbxg7"><span${$.attr_style(`font-size: ${$.stringify(size)}px`)} class="svelte-1fbbxg7">${$.escape(text)}</span></div>`);
}