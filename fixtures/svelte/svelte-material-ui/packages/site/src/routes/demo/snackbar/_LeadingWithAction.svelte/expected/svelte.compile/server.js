import * as $ from 'svelte/internal/server';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';

export default function _LeadingWithAction($$renderer) {
	let snackbar;
	let reason = 'nothing yet';

	function handleClosed(e) {
		reason = e.detail.reason ?? 'Undefined.';
	}

	Snackbar($$renderer, {
		leading: true,
		onSMUISnackbarClosed: handleClosed,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a leading snackbar.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Action`);
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

	$$renderer.push(`<!----> <pre class="status">Closed Reason: ${$.escape(reason)}</pre>`);
}