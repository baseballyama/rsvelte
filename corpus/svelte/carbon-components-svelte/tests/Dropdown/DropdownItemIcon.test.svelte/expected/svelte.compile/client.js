import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";

var root = $.from_html(`<span> </span>`);

export default function DropdownItemIcon_test($$anchor) {
	const items = [
		{ id: "0", text: "With icon", icon: Edit },
		{ id: "1", text: "No icon" }
	];

	Dropdown($$anchor, {
		get items() {
			return items;
		},
		selectedId: '0',
		open: true,
		labelText: 'Item icons',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const selected = $.derived(() => $$slotProps.selected);
				const highlighted = $.derived(() => $$slotProps.highlighted);
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => {
					$.set_attribute(span, 'data-testid', `item-${$.get(item).id ?? ''}`);
					$.set_attribute(span, 'data-selected', $.get(selected));
					$.set_attribute(span, 'data-highlighted', $.get(highlighted));
					$.set_text(text, $.get(item).text);
				});

				$.append($$anchor, span);
			}
		}
	});
}