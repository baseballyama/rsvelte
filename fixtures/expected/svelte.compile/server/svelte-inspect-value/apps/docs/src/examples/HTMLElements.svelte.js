import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';

export default function HTMLElements($$renderer) {
	let div = void 0;
	let width = 500;
	let classes = 'radius';
	let testid = 'demo-div';
	let group = 'simple';

	$$renderer.push(`<div${$.attr_class(`demo-div ${$.stringify(classes)}`, 'svelte-bminps')}${$.attr_style(`width: ${$.stringify(width)}px;`)}${$.attr('data-testid', testid)}><label>testid <input type="text"${$.attr('value', testid)} class="svelte-bminps"/></label> <label>width <input type="number"${$.attr('value', width)} step="10" max="1000" min="450" class="svelte-bminps"/></label> <label>extra class `);

	$$renderer.select(
		{ value: classes, class: '' },
		($$renderer) => {
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
		},
		'svelte-bminps'
	);

	$$renderer.push(`</label> <ul><!--[-->`);

	const each_array = $.ensure_array_like({ length: 100 });

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		$$renderer.push(`<li class="svelte-bminps">${$.escape(i)}</li>`);
	}

	$$renderer.push(`<!--]--></ul> <ul class="horiz svelte-bminps"><!--[-->`);

	const each_array_1 = $.ensure_array_like({ length: 100 });

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		$$renderer.push(`<li class="svelte-bminps">${$.escape(i)}</li>`);
	}

	$$renderer.push(`<!--]--></ul></div> `);

	Inspect($$renderer, {
		value: div,
		name: 'htmlElement',
		class: 'not-content mt',
		expandLevel: 1,
		elementView: group
	});

	$$renderer.push(`<!----> <div class="input-row"><fieldset class="not-content svelte-bminps"><legend>Element View</legend> <label class="svelte-bminps"><input type="radio"${$.attr('checked', group === 'simple', true)} value="simple"/> <span>simple</span></label> <label class="svelte-bminps"><input type="radio"${$.attr('checked', group === 'full', true)} value="full"/> <span>full</span></label></fieldset></div>`);
}