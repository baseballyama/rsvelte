import * as $ from 'svelte/internal/server';
import { Select } from "../Select.svelte.js";

export default function SelectTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "one", value: 1 },
			{ label: "a", value: "a" },
			{ label: "obj", value: { a: 1, b: 2 } }
		];

		const select = new Select({ multiple: true, sameWidth: false });

		$$renderer.push(`<label${$.attr('for', select.ids.trigger)}>Label</label> <button${$.attributes({ ...select.trigger })}><span class="truncate">${$.escape(select.valueAsString || "Select an item")}</span></button> <div${$.attributes({ ...select.content })}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div${$.attributes({ ...select.getOption(item.value, item.label) })}><span>${$.escape(item.label)}</span> `);

			if (select.isSelected(item.value)) {
				$$renderer.push(`<!--[0-->selected`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}