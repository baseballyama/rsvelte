import * as $ from 'svelte/internal/server';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

export default function _StackedWithAction($$renderer) {
	let snackbar;
	let reason = 'nothing yet';
	let action = 'nothing yet';

	function handleClosedStacked(e) {
		reason = e.detail.reason ?? 'Undefined.';
	}

	Snackbar($$renderer, {
		variant: 'stacked',
		onSMUISnackbarClosed: handleClosedStacked,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a stacked snackbar. Use it when you have really long text.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => action = 'Something',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Something`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => action = 'Another',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Another`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					IconButton($$renderer, {
						onclick: () => action = 'Dismissed',
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => snackbar.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Snackbar`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Closed Reason: ${$.escape(reason)}</pre> <pre class="status">Action: ${$.escape(action)}</pre>`);
}