import * as $ from 'svelte/internal/server';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import { Label } from '@smui/common';

export default function _Disappearing($$renderer) {
	let show = true;

	if (show) {
		$$renderer.push(`<!--[0--><div>`);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					touch: true,
					onclick: () => show = false,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click Me to Disappear My Container`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->I am a tooltip in a container that disappears.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div>`);

	Button($$renderer, {
		touch: true,
		onclick: () => show = true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me to Reset`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}