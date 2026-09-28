import * as $ from 'svelte/internal/server';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';

export default function _Square($$renderer) {
	$$renderer.push(`<div style="margin-top: 2em;">`);

	Button($$renderer, {
		style: 'position: relative;',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Square Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				square: true,
				'aria-label': 'unread count',
				children: ($$renderer) => {
					$$renderer.push(`<!---->5`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}