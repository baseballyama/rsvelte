import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';

export default function ConfiguredExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3 } };
		const InspectVals = Inspect.Values.withOptions(() => ({ expandLevel: 0, elementAttributes: { class: 'not-content' } }));

		// elementAttributes will be to applied to outermost Inspect div
		const DarkInspect = Inspect.Values.withOptions(() => ({
			theme: 'dark',
			elementAttributes: { style: 'max-width: 300px', class: 'not-content' }
		}));

		// create another variation that will inherit from the previous one
		const DarkBorderless = DarkInspect.withOptions(() => ({ borderless: true }));

		$$renderer.push(`<div class="not-content svelte-nqbk31">`);
		InspectVals($$renderer, { msg: 'i have been configured', data });
		$$renderer.push(`<!----> `);

		if (DarkInspect.Expand0) {
			$$renderer.push('<!--[-->');
			DarkInspect.Expand0($$renderer, { msg: 'me too', data });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (DarkBorderless.Expand1) {
			$$renderer.push('<!--[-->');
			DarkBorderless.Expand1($$renderer, $.spread_props([{ msg: 'i inherit options from DarkInspect' }, data]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}