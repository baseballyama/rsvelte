import * as $ from 'svelte/internal/server';
import { Clipboard, Input, Tooltip, Modal, Button, Label } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid, ShareNodesOutline } from "flowbite-svelte-icons";

export default function Modal_1($$renderer) {
	let value = "npm install flowbite-svelte";
	let copyModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			color: 'alternative',
			onclick: () => copyModal = true,
			children: ($$renderer) => {
				ShareNodesOutline($$renderer, { class: 'me-2' });
				$$renderer.push(`<!----> Share course`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function footer($$renderer) {
				Button($$renderer, {
					onclick: () => copyModal = false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Close`);
					},
					$$slots: { default: true }
				});
			}

			Modal($$renderer, {
				title: 'Share course',
				autoclose: true,
				class: 'divide-y-0',
				classes: {
					header: "text-lg text-gray-500 dark:text-gray-400",
					footer: "px-5 pb-5"
				},

				get open() {
					return copyModal;
				},

				set open($$value) {
					copyModal = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					Label($$renderer, {
						for: 'course-url',
						class: 'mb-2 block text-sm font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Share the course link below with your friends:`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

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
							id: 'course-url',
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { footer: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}