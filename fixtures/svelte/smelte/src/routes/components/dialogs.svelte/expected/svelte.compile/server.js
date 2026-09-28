import * as $ from 'svelte/internal/server';
import Button from "components/Button";
import Dialog from "components/Dialog";
import Code from "docs/Code.svelte";
import dialog from "examples/dialog.txt";

export default function Dialogs($$renderer) {
	let showDialog = false;
	let showDialog2 = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			get value() {
				return showDialog;
			},

			set value($$value) {
				showDialog = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div class="text-gray-700 dark:text-gray-100">I'm not sure about today's weather.</div>`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					$$renderer.push(`<h5 slot="title">What do you think?</h5>`);
				},

				actions: ($$renderer) => {
					$$renderer.push(`<div slot="actions">`);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disagree`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Agree`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			persistent: true,
			get value() {
				return showDialog2;
			},

			set value($$value) {
				showDialog2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div class="text-gray-700 dark:text-gray-100">Doubt it.</div>`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					$$renderer.push(`<h5 slot="title">Do you think you can close me by clicking outside?</h5>`);
				},

				actions: ($$renderer) => {
					$$renderer.push(`<div slot="actions">`);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Yes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->No`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> <div class="py-2">`);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="py-2">`);

		Button($$renderer, {
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show persistent dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);
		Code($$renderer, { code: dialog });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}