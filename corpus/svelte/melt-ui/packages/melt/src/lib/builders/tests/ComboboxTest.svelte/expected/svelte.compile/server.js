import * as $ from 'svelte/internal/server';
import { Combobox } from "../Combobox.svelte.js";

export default function ComboboxTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "one", value: 1 },
			{ label: "a", value: "a" },
			{ label: "obj", value: { a: 1, b: 2 } }
		];

		const combobox = new Combobox({ multiple: true });

		$$renderer.push(`<label${$.attr('for', combobox.ids.input)}>Label</label> <input${$.attributes({ ...combobox.input }, void 0, void 0, void 0, 4)}/> <button${$.attributes({ ...combobox.trigger })}>Toggle</button> <div${$.attributes({ ...combobox.content })}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div${$.attributes({ ...combobox.getOption(item.value, item.label) })}><span>${$.escape(item.label)}</span> `);

			if (combobox.isSelected(item.value)) {
				$$renderer.push(`<!--[0-->selected`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}