import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup } from '../../src/index.js';

export default function Toggle_group($$anchor) {
	ToggleGroup($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
				ToggleGroup_Item($$anchor, { value: 'item', 'data-testid': 'item' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}