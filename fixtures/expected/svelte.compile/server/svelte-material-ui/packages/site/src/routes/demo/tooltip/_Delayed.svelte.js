import * as $ from 'svelte/internal/server';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import { Label } from '@smui/common';

export default function _Delayed($$renderer) {
	$$renderer.push(`<div>`);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Show Delay: 1s, Hide Delay: 2s`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				showDelay: 1000,
				hideDelay: 2000,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->I am a delayed tooltip.`);
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
}