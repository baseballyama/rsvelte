import * as $ from 'svelte/internal/server';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Simple($$renderer) {
	let snackbarWithClose;
	let snackbarWithoutClose;

	Snackbar($$renderer, {
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a snackbar.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				children: ($$renderer) => {
					IconButton($$renderer, {
						title: 'Dismiss',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->close`);
								},
								$$slots: { default: true }
							});
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

	$$renderer.push(`<!----> `);

	Snackbar($$renderer, {
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a snackbar.`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => snackbarWithClose.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Snackbar With Dismiss`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => snackbarWithoutClose.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Snackbar Without Dismiss`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}