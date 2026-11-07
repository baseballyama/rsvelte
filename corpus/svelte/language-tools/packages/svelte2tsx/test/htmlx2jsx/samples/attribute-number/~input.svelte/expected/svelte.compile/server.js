import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	SomeComponent($$renderer, { tabindex: '1' });
	$$renderer.push(`<!----> <div tabindex="1" maxlength="1"${$.attr('minlength', 1)}${$.attr('span', 1)} role="none"></div>`);
}