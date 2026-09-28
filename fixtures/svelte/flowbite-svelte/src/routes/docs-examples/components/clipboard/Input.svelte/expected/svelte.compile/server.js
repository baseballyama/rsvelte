import * as $ from 'svelte/internal/server';
import { Clipboard, Input, Tooltip } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Input_1($$renderer) {
	let value = "npm install flowbite";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-64">`);

		{
			function right($$renderer) {
				{
					function children($$renderer, success) {
						Tooltip($$renderer, {
							isOpen: success,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(success ? "Copied" : "Copy to clipboard")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (success) {
							$$renderer.push('<!--[0-->');
							CheckOutline($$renderer, {});
						} else {
							$$renderer.push('<!--[-1-->');
							ClipboardCleanSolid($$renderer, {});
						}

						$$renderer.push(`<!--]-->`);
					}

					Clipboard($$renderer, {
						embedded: true,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});
				}
			}

			Input($$renderer, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				right,
				$$slots: { right: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}