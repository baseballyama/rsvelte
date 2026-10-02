import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, LeadingIcon, TrailingIcon, Text } from '@smui/chips';

export default function _Simple($$renderer) {
	let clicked = 0;

	{
		function chip($$renderer, chip) {
			Chip($$renderer, {
				chip,
				shouldRemoveOnTrailingIconClick: false,
				onclick: () => clicked++,
				children: ($$renderer) => {
					if (chip === 'four') {
						$$renderer.push('<!--[0-->');

						LeadingIcon($$renderer, {
							class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->book`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Text($$renderer, {
						tabindex: 0,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(chip)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (chip === 'five') {
						$$renderer.push('<!--[0-->');

						TrailingIcon($$renderer, {
							class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->commute`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		ChipSet($$renderer, {
			chips: ['one', 'two', 'three', 'four', 'five'],
			chip,
			$$slots: { chip: true }
		});
	}

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}