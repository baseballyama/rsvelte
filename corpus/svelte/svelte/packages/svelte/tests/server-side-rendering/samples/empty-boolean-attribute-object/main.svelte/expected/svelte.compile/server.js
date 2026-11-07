import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const props = {};

	$$renderer.push(`<input${$.attributes({ disabled: '', ...props }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ hidden: '', ...props }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ disabled: false, ...props }, void 0, void 0, void 0, 4)}/> `);

	$$renderer.select({ multiple: '', value: 'a' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});
	});
}