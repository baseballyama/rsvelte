import * as $ from 'svelte/internal/server';
import Snackbar, { notifier, Notifications } from "components/Snackbar";
import Button from "components/Button";
import TextField from "components/TextField";
import Code from "docs/Code.svelte";
import snackbars from "examples/snackbars.txt";

export default function Snackbars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showSnackbar = false;
		let showSnackbarTop = false;
		let showSnackbarBottomLeft = false;

		function notify() {
			notifier.notify(message);
			message = "";
		}

		function alert() {
			notifier.alert(message);
			message = "";
		}

		function error() {
			notifier.error(message);
			message = "";
		}

		let message = "";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/snackbars/#usage"><p>Snackbars inform users of a process that an app has performed or will perform. They appear temporarily, towards the bottom of the screen. They shouldn’t interrupt the user experience, and they don’t require user input to disappear.</p> <h6 class="mt-8">Frequency</h6> <p>Only one snackbar may be displayed at a time.</p> <h6 class="mt-8">Actions</h6> <p>A snackbar can contain a single action. Because they disappear automatically, the action shouldn’t be “Dismiss” or “Cancel.”</p></blockquote> `);

			Snackbar($$renderer, {
				get value() {
					return showSnackbar;
				},

				set value($$value) {
					showSnackbar = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div>Have a nice day.</div>`);
				},

				$$slots: {
					default: true,
					action: ($$renderer) => {
						$$renderer.push(`<div slot="action">`);

						Button($$renderer, {
							text: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Do something`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Snackbar($$renderer, {
				color: 'alert',
				top: true,
				get value() {
					return showSnackbarTop;
				},

				set value($$value) {
					showSnackbarTop = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div>Have a nice day.</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Snackbar($$renderer, {
				noAction: true,
				color: 'error',
				timeout: 2000,
				left: true,
				get value() {
					return showSnackbarBottomLeft;
				},

				set value($$value) {
					showSnackbarBottomLeft = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div>Something happened!</div>`);
				},

				$$slots: {
					default: true,
					action: ($$renderer) => {
						$$renderer.push(`<div slot="action"></div>`);
					}
				}
			});

			$$renderer.push(`<!----> <div class="py-2">`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show snackbar`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="py-2">`);

			Button($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show snackbar on top`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="py-2">`);

			Button($$renderer, {
				color: 'alert',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show snackbar on the bottom left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <p class="mt-10">Also Smelte comes with a simple notification queue implementation.</p> `);

			TextField($$renderer, {
				label: 'Message text',
				get value() {
					return message;
				},

				set value($$value) {
					message = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: !message,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add Notification to queue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: !message,
				color: 'alert',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Alert message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: !message,
				color: 'error',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Error message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Notifications($$renderer, {});
			$$renderer.push(`<!----> `);
			Code($$renderer, { code: snackbars });
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}