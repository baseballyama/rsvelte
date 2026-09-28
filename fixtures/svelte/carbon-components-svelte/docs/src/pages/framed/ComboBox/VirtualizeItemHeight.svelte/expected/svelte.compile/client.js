import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, Stack } from "carbon-components-svelte";

var root = $.from_html(`<strong> </strong> <span> </span>`, 1);

export default function VirtualizeItemHeight($$anchor, $$props) {
	$.push($$props, true);

	const items = Array.from({ length: 10_000 }, (_, i) => ({
		id: i,
		text: `Item ${i + 1}`,
		description: `Description for item ${i + 1}`
	}));

	let value = "";
	let selectedId = undefined;

	ComboBox($$anchor, {
		virtualize: { itemHeight: 60 },
		labelText: 'Custom item height (60px)',
		placeholder: 'Filter...',
		get items() {
			return items;
		},
		shouldFilterItem: (item, value) => item.text.toLowerCase().includes(value.toLowerCase()),
		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);

				Stack($$anchor, {
					gap: 2,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var strong = $.first_child(fragment_2);
						var text = $.only_child(strong, true);
						var span = $.sibling(strong, 2);
						var text_1 = $.only_child(span, true);

						$.template_effect(() => {
							$.set_text(text, $.get(item).text);
							$.set_text(text_1, $.get(item).description);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
}