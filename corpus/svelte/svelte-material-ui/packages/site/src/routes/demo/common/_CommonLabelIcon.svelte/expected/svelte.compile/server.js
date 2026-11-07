import * as $ from 'svelte/internal/server';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon, Label } from '@smui/common';

export default function _CommonLabelIcon($$renderer) {
	$$renderer.push(`<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1em;">`);

	Button($$renderer, {
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button with a Label`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Fab($$renderer, {
		extended: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Fab with a Label`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	IconButton($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Fab($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}