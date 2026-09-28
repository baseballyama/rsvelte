import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, Text } from '@smui/chips';

export default function _NonInteractive($$renderer) {
	{
		function chip($$renderer, chip) {
			Chip($$renderer, {
				chip,
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(chip)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		ChipSet($$renderer, {
			chips: ['one', 'two', 'three', 'four', 'five'],
			nonInteractive: true,
			chip,
			$$slots: { chip: true }
		});
	}
}