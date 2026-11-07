import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let text = "abc";
	const maxlength = 42;
	const attrs = { disabled: true };

	function click() {}

	$$renderer.push(`<input${$.attributes(
		{
			type: 'text',
			class: 'a b',
			value: text,
			maxlength,
			...attrs,
			readonly: true
		},
		'svelte-7bm41u',
		void 0,
		void 0,
		4
	)}/> <button${$.attributes({ type: 'button', maxlength, ...attrs }, 'svelte-7bm41u')}>CLICK ME!</button> <div data-attr=""><div data-attr=""><div data-attr=""><input${$.attributes(
		{
			type: 'text',
			class: 'a b',
			value: text,
			maxlength,
			...attrs,
			readonly: true
		},
		'svelte-7bm41u',
		void 0,
		void 0,
		4
	)}/> <button${$.attributes({ type: 'button', maxlength, ...attrs }, 'svelte-7bm41u')}>CLICK
ME!</button></div></div> <div data-attr=""></div></div>`);
}