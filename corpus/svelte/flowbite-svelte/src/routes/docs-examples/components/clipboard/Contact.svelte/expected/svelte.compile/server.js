import * as $ from 'svelte/internal/server';
import { Card, Clipboard, Tooltip } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Contact($$renderer) {
	let value = "";

	function onclick(ev) {
		const target = ev.target;
		const codeBlock = target.ownerDocument.querySelector("#contact-details");

		if (codeBlock) {
			value = codeBlock.textContent || "";
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Card($$renderer, {
			class: 'relative p-5',
			children: ($$renderer) => {
				$$renderer.push(`<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Contact details</h2> <address class="relative grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-4 not-italic dark:border-gray-600 dark:bg-gray-700"><div class="hidden space-y-2 leading-loose text-gray-500 sm:block dark:text-gray-400">Name <br/> Email <br/> Phone Number</div> <div id="contact-details" class="space-y-2 leading-loose font-medium text-gray-900 dark:text-white">Bonnie Green <br/> name@flowbite.com <br/> + 12 345 67890</div></address> `);

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
						onclick,
						embedded: true,
						class: 'absolute end-2 top-2 h-8 px-2.5 font-medium focus:ring-0',
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}