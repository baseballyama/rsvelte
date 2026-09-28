import * as $ from 'svelte/internal/server';
import { ToggleGroup } from '../../src/index.js';

export default function Toggle_group($$renderer) {
	ToggleGroup($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');
				ToggleGroup.Item($$renderer, { value: 'item', 'data-testid': 'item' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}