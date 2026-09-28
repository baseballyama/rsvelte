import * as $ from 'svelte/internal/server';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';

export default function _Simple($$renderer) {
	$$renderer.push(`<div><span style="position: relative;">Text with a badge. `);

	Badge($$renderer, {
		'aria-label': 'unread count',
		children: ($$renderer) => {
			$$renderer.push(`<!---->3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></span></div> <div style="margin-top: 2em;">`);

	Button($$renderer, {
		style: 'position: relative;',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button with a Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				'aria-label': 'new messages count',
				children: ($$renderer) => {
					$$renderer.push(`<!---->7`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div style="margin-top: 1.5em;">Icon button with a badge. `);

	IconButton($$renderer, {
		style: 'position: relative;',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				'aria-label': 'unread content count',
				children: ($$renderer) => {
					$$renderer.push(`<!---->2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div style="margin-top: 1.5em;">FAB with a badge. `);

	Fab($$renderer, {
		style: 'position: relative;',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				'aria-label': 'unread content count',
				children: ($$renderer) => {
					$$renderer.push(`<!---->2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div style="margin-top: 1.5em;"><span style="position: relative; display: inline-block; padding: .5em .5em 0 0;">Long content in a badge. `);

	Badge($$renderer, {
		'aria-label': 'notification count',
		children: ($$renderer) => {
			$$renderer.push(`<!---->1,000,000`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></span></div> <div style="margin-top: 1.5em;"><span style="position: relative;">No content in a badge. `);

	Badge($$renderer, {
		'aria-label': 'unread content is available',
		style: 'min-height: 10px; min-width: 10px; padding: 0;'
	});

	$$renderer.push(`<!----></span></div>`);
}