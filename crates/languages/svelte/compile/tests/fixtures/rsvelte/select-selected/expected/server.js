import * as $ from 'svelte/internal/server';

import { vmodel, vModelSelect, looseEqual } from './runtime.js';

export default function Select_selected($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let model = 'b';
		$$renderer.push(`<select>`);
		$$renderer.option({ value: 'a', selected: looseEqual(model, 'a') ? '' : undefined }, ($$renderer) => {
			$$renderer.push(`A`);
		});
		$$renderer.option({ value: 'b', selected: looseEqual(model, 'b') ? '' : undefined }, ($$renderer) => {
			$$renderer.push(`B`);
		});
		$$renderer.option({ disabled: model === 'a' ? '' : undefined }, ($$renderer) => {
			$$renderer.push(`c`);
		});
		$$renderer.push(`</select>`);
	});
}
