import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<input/> <input tabindex="0"/> <input aria-activedescendant="some-id"/> <input aria-activedescendant="some-id"${$.attr('tabindex', 0)}/> <input aria-activedescendant="some-id"${$.attr('tabindex', 1)}/> <input aria-activedescendant="some-id" tabindex="0"/> <input aria-activedescendant="some-id"${$.attr('tabindex', -1)}/> <input aria-activedescendant="some-id" tabindex="-1"/> `);

	$.element($$renderer, Math.random() ? 'input' : 'button', () => {
		$$renderer.push(` aria-activedescendant="some-id"`);
	});

	$$renderer.push(` <div></div> <div aria-activedescendant="some-id" role="tablist"${$.attr('tabindex', -1)}></div> <div aria-activedescendant="some-id" role="tablist" tabindex="-1"></div> <div aria-activedescendant="some-id"></div>`);
}