import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let text = 'abc';
	const maxlength = 42;
	const attrs = { disabled: true };

	function click() {}

	$$renderer.push(`<input${$.attributes(
		{
			type: 'text',
			value: text,
			maxlength,
			...attrs,
			readonly: true
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <button${$.attributes({ type: 'button', maxlength, ...attrs })}>CLICK ME!</button>`);
}