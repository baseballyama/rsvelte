import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox } from "carbon-components-svelte";

var root = $.from_html(`<div><strong> </strong></div> <div> </div>`, 1);

export default function ComboBoxSlot($$anchor) {
	ComboBox($$anchor, {
		labelText: 'Contact',
		placeholder: 'Select contact method',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const index = $.derived(() => $$slotProps.index);
				const selected = $.derived(() => $$slotProps.selected);
				const highlighted = $.derived(() => $$slotProps.highlighted);
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var strong = $.child(div);
				var text = $.only_child(strong, true);

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var text_1 = $.only_child(div_1);

				$.template_effect(() => {
					$.set_text(text, $.get(item).text);

					$.set_text(text_1, `id: ${$.get(item).id ?? ''} - index: ${$.get(index) ?? ''} - selected: ${$.get(selected) ?? ''} - highlighted:
    ${$.get(highlighted) ?? ''}`);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});
}