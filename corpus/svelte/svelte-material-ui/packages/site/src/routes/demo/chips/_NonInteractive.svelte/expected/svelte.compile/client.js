import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, Text } from '@smui/chips';

export default function _NonInteractive($$anchor) {
	{
		const chip = ($$anchor, chip = $.noop) => {
			Chip($$anchor, {
				get chip() {
					return chip();
				},

				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, chip()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		ChipSet($$anchor, {
			chips: ['one', 'two', 'three', 'four', 'five'],
			nonInteractive: true,
			chip,
			$$slots: { chip: true }
		});
	}
}