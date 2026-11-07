import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

export default function HTMLElements($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let div = void 0;
		let width = 500;
		let classes = 'radius';
		let testid = 'demo-div';

		getContext('toc')?.set('HTML Elements', 'html');

		let group = 'simple';

		$$renderer.push(`<div class="flex col"><h3 id="html">HTML Elements</h3> <fieldset class="svelte-e2q7hj"><legend>element view</legend> <label class="svelte-e2q7hj"><input type="radio"${$.attr('checked', group === 'simple', true)} value="simple"/> <span>simple</span></label> <label class="svelte-e2q7hj"><input type="radio"${$.attr('checked', group === 'full', true)} value="full"/> <span>full</span></label></fieldset> <div${$.attr_class(`demo-div ${$.stringify(classes)}`, 'svelte-e2q7hj')}${$.attr_style(`width: ${$.stringify(width)}px;`)}${$.attr('data-testid', testid)}><div><label>testid <input type="text"${$.attr('value', testid)} class="svelte-e2q7hj"/></label> <label>width <input type="number"${$.attr('value', width)} step="10" max="1000" min="450" class="svelte-e2q7hj"/></label> <label>extra class `);

		$$renderer.select({ value: classes }, ($$renderer) => {
			$$renderer.option({}, ($$renderer) => {});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`red`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`blue`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`radius`);
			});
		});

		$$renderer.push(`</label></div> <ul><!--[-->`);

		const each_array = $.ensure_array_like({ length: 100 });

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			$$renderer.push(`<li>${$.escape(i)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> `);

		Inspect($$renderer, {
			value: div,
			name: 'htmlElement',
			style: 'flex-basis: 100%',
			expandLevel: 0,
			elementView: group
		});

		$$renderer.push(`<!----></div>`);
	});
}