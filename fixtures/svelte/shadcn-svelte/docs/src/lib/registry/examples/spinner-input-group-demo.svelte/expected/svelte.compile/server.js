import * as $ from 'svelte/internal/server';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_input_group_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Send a message...', disabled: true });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							Spinner($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Textarea) {
					$$renderer.push('<!--[-->');
					InputGroup.Textarea($$renderer, { placeholder: 'Send a message...', disabled: true });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'block-end',
						children: ($$renderer) => {
							Spinner($$renderer, {});
							$$renderer.push(`<!----> Validating... `);

							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									class: 'ms-auto',
									variant: 'default',
									children: ($$renderer) => {
										ArrowUpIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Send</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}