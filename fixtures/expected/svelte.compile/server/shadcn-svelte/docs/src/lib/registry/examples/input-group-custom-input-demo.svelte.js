import * as $ from 'svelte/internal/server';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

export default function Input_group_custom_input_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-6">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<textarea data-slot="input-group-control" class="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm" placeholder="Autoresize textarea..."></textarea> `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'block-end',
						children: ($$renderer) => {
							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									class: 'ms-auto',
									size: 'sm',
									variant: 'default',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Submit`);
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