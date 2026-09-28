import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Button_33($$anchor) {
	let value = $.state('left');

	ToggleGroup($$anchor, {
		type: 'single',
		variant: 'outline',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToggleGroupItem(node, {
				class: 'flex-1',
				value: 'left',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Left');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ToggleGroupItem(node_1, {
				class: 'flex-1',
				value: 'center',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Center');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ToggleGroupItem(node_2, {
				class: 'flex-1',
				value: 'right',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Right');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}