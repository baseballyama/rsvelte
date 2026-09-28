import * as $ from 'svelte/internal/server';
import Link2Icon from "@lucide/svelte/icons/link-2";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Label from "$lib/registry/ui/label/index.js";

export default function Input_group_button_group_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-6">`);

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (ButtonGroup.Text) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Text($$renderer, {
						children: ($$renderer) => {
							if (Label.Root) {
								$$renderer.push('<!--[-->');

								Label.Root($$renderer, {
									for: 'url',
									children: ($$renderer) => {
										$$renderer.push(`<!---->https://`);
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
							if (InputGroup.Input) {
								$$renderer.push('<!--[-->');
								InputGroup.Input($$renderer, { id: 'url' });
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
										Link2Icon($$renderer, {});
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

				if (ButtonGroup.Text) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->.com`);
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