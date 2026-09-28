import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from './Dropdown.svelte';
import { DropdownMenu } from '../DropdownMenu';
import { DropdownItem } from '../DropdownItem';
import { DropdownToggle } from '../DropdownToggle';

var root = $.from_html(`<!> <!>`, 1);

export default function Dropdown_spec($$anchor) {
	Dropdown($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DropdownToggle(node, {
				caret: true,
				class: 'coconut',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			DropdownMenu(node_1, {
				class: 'cocoa',
				children: ($$anchor, $$slotProps) => {
					DropdownItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Alpha');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}