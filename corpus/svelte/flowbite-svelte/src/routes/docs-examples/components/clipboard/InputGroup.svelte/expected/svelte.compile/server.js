import * as $ from 'svelte/internal/server';
import { Clipboard, Input, InputAddon, Tooltip, ButtonGroup } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function InputGroup($$renderer) {
	let value = "https://flowbite.com";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				InputAddon($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->URL`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					readonly: true,
					disabled: true,
					class: 'w-64',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, success) {
						Tooltip($$renderer, {
							class: 'whitespace-nowrap',
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
						color: 'primary',
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