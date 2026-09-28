import * as $ from 'svelte/internal/server';
import { Label, ButtonGroup, Select, Clipboard, Tooltip, Helper, A } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Select_1($$renderer) {
	let selected = "+1 234 456 7890";

	const phonenumbers = [
		{ value: "+1 234 456 7890", name: "+1 234 456 7890" },
		{ value: "+1 456 234 7890", name: "+1 456 234 7890" },
		{ value: "+1 432 621 3163", name: "+1 432 621 3163" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form class="mx-auto max-w-sm"><div class="mb-2 flex items-center justify-between">`);

		Label($$renderer, {
			for: 'phone-numbers',
			class: 'text-sm font-medium text-gray-900 dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary phone number:`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		A($$renderer, {
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Manage numbers`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		ButtonGroup($$renderer, {
			class: 'flex',
			children: ($$renderer) => {
				Select($$renderer, {
					id: 'phone-numbers',
					classes: { select: "border-r-0" },
					items: phonenumbers,
					'aria-describedby': 'helper-text-explanation',
					get value() {
						return selected;
					},

					set value($$value) {
						selected = $$value;
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
						color: 'alternative',
						class: 'z-10 inline-flex shrink-0 items-center rounded-e-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus:ring-4 focus:ring-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700',
						get value() {
							return selected;
						},

						set value($$value) {
							selected = $$value;
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
			id: 'helper-text-explanation',
			class: 'mt-2 text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Please set your primary phone number.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}