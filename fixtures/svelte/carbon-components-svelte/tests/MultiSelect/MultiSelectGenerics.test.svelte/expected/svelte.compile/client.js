import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

var root = $.from_html(`<div><strong> </strong> <span> </span></div>`);

export default function MultiSelectGenerics_test($$anchor) {
	const items = [
		{ id: "1", text: "Laptop", price: 999, category: "Electronics" },
		{ id: "2", text: "Phone", price: 599, category: "Electronics" },
		{ id: "3", text: "Desk", price: 299, category: "Furniture" }
	];

	MultiSelect($$anchor, {
		get items() {
			return items;
		},
		label: 'Choose products',
		labelText: 'Products',
		$$events: {
			select: (e) => {
				console.log("selected:", e.detail.selected);
			}
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);

				const computed_const = $.derived(() => {
					return $.get(item);
				});

				var div = root();
				var strong = $.child(div);
				var text_1 = $.only_child(strong, true);
				var text_2 = $.sibling(strong);
				var span = $.sibling(text_2);
				var text_3 = $.only_child(span);

				$.reset(div);

				$.template_effect(() => {
					$.set_text(text_1, $.get(computed_const).text);

					$.set_text(text_2, ` - $${$.get(computed_const).price ?? ''}
    - ${$.get(computed_const).id ?? ''} `);

					$.set_text(text_3, `(${$.get(computed_const).category ?? ''})`);
				});

				$.append($$anchor, div);
			}
		}
	});
}