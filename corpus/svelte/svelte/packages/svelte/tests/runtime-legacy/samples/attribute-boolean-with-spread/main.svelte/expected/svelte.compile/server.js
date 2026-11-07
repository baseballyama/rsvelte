import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input${$.attributes(
		{
			...{ foo: null },
			readonly: false,
			required: false,
			disabled: null
		},
		void 0,
		void 0,
		void 0,
		4
	)}/>`);
}