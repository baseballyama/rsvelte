import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

var root = $.from_html(`<span>L</span>`);
var root_1 = $.from_html(`<span>R</span>`);

export default function ComboBoxIconSlots_test($$anchor) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	ComboBox($$anchor, {
		get items() {
			return items;
		},
		selectedId: '0',
		open: true,
		labelText: 'Icon slots',
		$$slots: {
			icon: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var span = root();

				$.template_effect(() => $.set_attribute(span, 'data-testid', `left-${$.get(item).id ?? ''}`));
				$.append($$anchor, span);
			},

			iconRight: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const selected = $.derived(() => $$slotProps.selected);
				var span_1 = root_1();

				$.template_effect(() => {
					$.set_attribute(span_1, 'data-testid', `right-${$.get(item).id ?? ''}`);
					$.set_attribute(span_1, 'data-selected', $.get(selected));
				});

				$.append($$anchor, span_1);
			}
		}
	});
}