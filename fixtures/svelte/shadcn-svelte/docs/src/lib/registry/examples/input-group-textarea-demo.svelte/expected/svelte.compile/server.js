import * as $ from 'svelte/internal/server';
import IconBrandJavascript from "@tabler/icons-svelte/icons/brand-javascript";
import IconCopy from "@tabler/icons-svelte/icons/copy";
import IconCornerDownLeft from "@tabler/icons-svelte/icons/corner-down-left";
import IconRefresh from "@tabler/icons-svelte/icons/refresh";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

export default function Input_group_textarea_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-md gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'block-start',
						class: 'border-b',
						children: ($$renderer) => {
							if (InputGroup.Text) {
								$$renderer.push('<!--[-->');

								InputGroup.Text($$renderer, {
									class: 'font-mono font-medium',
									children: ($$renderer) => {
										IconBrandJavascript($$renderer, {});
										$$renderer.push(`<!----> script.js`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									class: 'ms-auto',
									size: 'icon-xs',
									children: ($$renderer) => {
										IconRefresh($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									variant: 'ghost',
									size: 'icon-xs',
									children: ($$renderer) => {
										IconCopy($$renderer, {});
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

				if (InputGroup.Textarea) {
					$$renderer.push('<!--[-->');

					InputGroup.Textarea($$renderer, {
						placeholder: 'console.log(\'Hello, world!\');',
						class: 'min-h-[200px]'
					});

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
						class: 'border-t',
						children: ($$renderer) => {
							if (InputGroup.Text) {
								$$renderer.push('<!--[-->');

								InputGroup.Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Line 1, Column 1`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									size: 'sm',
									class: 'ms-auto',
									variant: 'default',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Run `);
										IconCornerDownLeft($$renderer, {});
										$$renderer.push(`<!---->`);
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