import * as $ from 'svelte/internal/server';
import Snackbar, { Label, Actions } from '@smui/snackbar';
import IconButton, { Icon } from '@smui/icon-button';
import Button from '@smui/button';

export default function _Colors($$renderer) {
	let snackbarSuccess;
	let snackbarWarning;
	let snackbarError;

	Snackbar($$renderer, {
		class: 'demo-success',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->That thing you tried to do actually worked, if you can believe it!`);
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
		class: 'demo-warning',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ok, it looks like that thing you tried to do might not have work.`);
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
		class: 'demo-error',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->That thing you tried to do didn't work. Honestly, I'm not sure why you even
    tried.`);
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

	Button($$renderer, {
		onclick: () => snackbarSuccess.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Success Snackbar`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => snackbarWarning.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Warning Snackbar`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => snackbarError.open(),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Error Snackbar`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}