import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p class="before svelte-17pp353">before</p> `);
	children($$renderer);
	$$renderer.push(`<!----> <p class="foo svelte-17pp353"><span class="svelte-17pp353">foo</span></p> <p class="bar svelte-17pp353">bar</p></div>`);
}