import * as $ from 'svelte/internal/server';

import {
	Clipboard,
	Input,
	Label,
	Helper,
	Button,
	Tooltip,
	ButtonGroup
} from "flowbite-svelte";

import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Url($$renderer) {
	let value = "https://bit.ly/3U2SXcF";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: 'url-shortener',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Shorten URL:`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Generate`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'url-shortener',
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
								$$renderer.push(`<!---->${$.escape(success ? "Copied" : "Copy link")}`);
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

		$$renderer.push(`<!----> `);

		Helper($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Make sure that your URL is valid`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}