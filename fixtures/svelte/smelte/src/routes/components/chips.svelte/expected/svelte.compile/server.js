import * as $ from 'svelte/internal/server';
import Chip from "components/Chip";
import Button from "components/Button";
import Snackbar from "components/Snackbar";
import Code from "docs/Code.svelte";
import chip from "examples/chip.txt";
import chipOutlined from "examples/chip-outlined.txt";

export default function Chips($$renderer) {
	let closed = false;
	let clicked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h5 class="mt-6 mb-2">Basic</h5> `);

		Chip($$renderer, {
			icon: 'face',
			selectable: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->test`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="my-4">`);
		Code($$renderer, { code: chip });
		$$renderer.push(`<!----></div> <h5 class="mt-6 mb-2">Outlined</h5> `);

		Chip($$renderer, {
			icon: 'pan_tool',
			outlined: true,
			removable: true,
			selectable: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Cats`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Chip($$renderer, {
			icon: 'print',
			outlined: true,
			removable: true,
			selectable: true,
			color: 'blue',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dogs`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Chip($$renderer, {
			icon: 'pageview',
			outlined: true,
			removable: true,
			selectable: true,
			color: 'alert',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Plants`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Chip($$renderer, {
			icon: 'pets',
			outlined: true,
			removable: true,
			selectable: true,
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Parents`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="my-4">`);
		Code($$renderer, { lang: 'javascript', code: chipOutlined });
		$$renderer.push(`<!----></div> `);

		Snackbar($$renderer, {
			get value() {
				return closed;
			},

			set value($$value) {
				closed = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Chip was removed successfully.`);
			},

			$$slots: {
				default: true,
				action: ($$renderer) => {
					$$renderer.push(`<div slot="action">`);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dismiss`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		Snackbar($$renderer, {
			get value() {
				return clicked;
			},

			set value($$value) {
				clicked = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Chip was clicked successfully.`);
			},

			$$slots: {
				default: true,
				action: ($$renderer) => {
					$$renderer.push(`<div slot="action">`);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dismiss`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}