import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

export default function ExamplesCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			examples,
			selectedIndex = null,
			onSelect,
			title = 'Quick Examples',
			getLabel,
			getDescription,
			getTooltip
		} = $$props;

		$$renderer.push(`<div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>${$.escape(title)}</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedIndex === i })}><h5>${$.escape(getLabel(example))}</h5> <p>${$.escape(getDescription(example))}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div>`);
	});
}