import * as $ from 'svelte/internal/server';
import { Card, Clipboard, Input, Label, Tooltip, Button } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

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

export default function ApiKeys($$renderer) {
	let acc_id = "756593826";
	let api_key = "f4h6sd3t-jsy63ind-hsgdt7rs-jdhf76st";
	let role_arn = "123456789012:user/Flowbite";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Card($$renderer, {
			size: 'md',
			class: 'p-4 sm:p-6 md:p-8',
			children: ($$renderer) => {
				$$renderer.push(`<form class="flex flex-col space-y-6" action="/"><h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Create a role with read only in-line policies</h2> <p class="mb-6 text-gray-500 dark:text-gray-400">To give Flowbite read access, please create an IAM Role following <a href="#top" class="font-medium text-blue-700 underline hover:no-underline dark:text-blue-500">trust relationship</a> and <a href="#top" class="font-medium text-blue-700 underline hover:no-underline dark:text-blue-500">inline policy</a> .</p> `);

				Label($$renderer, {
					class: 'space-y-2 font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<div>Flowbite account ID:</div> `);

						{
							function right($$renderer) {
								Clipboard($$renderer, {
									embedded: true,
									children,
									get value() {
										return acc_id;
									},

									set value($$value) {
										acc_id = $$value;
										$$settled = false;
									}
								});
							}

							Input($$renderer, {
								readonly: true,
								disabled: true,
								get value() {
									return acc_id;
								},

								set value($$value) {
									acc_id = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					class: 'space-y-2 font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<div>API key:</div> `);

						{
							function right($$renderer) {
								Clipboard($$renderer, {
									embedded: true,
									children,
									get value() {
										return api_key;
									},

									set value($$value) {
										api_key = $$value;
										$$settled = false;
									}
								});
							}

							Input($$renderer, {
								readonly: true,
								disabled: true,
								get value() {
									return api_key;
								},

								set value($$value) {
									api_key = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					class: 'space-y-2 font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<div>Role ARN:</div> `);

						{
							function right($$renderer) {
								Clipboard($$renderer, {
									embedded: true,
									children,
									get value() {
										return role_arn;
									},

									set value($$value) {
										role_arn = $$value;
										$$settled = false;
									}
								});
							}

							Input($$renderer, {
								readonly: true,
								disabled: true,
								get value() {
									return role_arn;
								},

								set value($$value) {
									role_arn = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="flex gap-4">`);

				Button($$renderer, {
					color: 'alternative',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Cancel`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Next step`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></form>`);
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