import * as $ from 'svelte/internal/server';
import CopyIcon from "@lucide/svelte/icons/copy";
import CornerDownLeftIcon from "@lucide/svelte/icons/corner-down-left";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

export default function Input_group_textarea($$renderer) {
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
										$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14,2 14,8 20,8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 17 2-2-2-2"></path></svg> script.js`);
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
										RefreshCwIcon($$renderer, {});
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
										CopyIcon($$renderer, {});
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
										CornerDownLeftIcon($$renderer, {});
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