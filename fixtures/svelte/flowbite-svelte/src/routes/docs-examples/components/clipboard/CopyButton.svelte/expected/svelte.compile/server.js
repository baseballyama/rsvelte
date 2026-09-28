import * as $ from 'svelte/internal/server';
import { Clipboard, Input } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function CopyButton($$renderer) {
	let value = "npm install flowbite";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-64">`);

		{
			function right($$renderer) {
				{
					function children($$renderer, success) {
						if (success) {
							$$renderer.push('<!--[0-->');
							CheckOutline($$renderer, { class: 'h-3 w-3' });
							$$renderer.push(`<!----> Copied`);
						} else {
							$$renderer.push('<!--[-1-->');
							ClipboardCleanSolid($$renderer, { class: 'h-3 w-3' });
							$$renderer.push(`<!----> Copy`);
						}

						$$renderer.push(`<!--]-->`);
					}

					Clipboard($$renderer, {
						size: 'xs',
						color: 'alternative',
						class: '-mr-1 w-20 focus:ring-0',
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
				class: 'text-sm',
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