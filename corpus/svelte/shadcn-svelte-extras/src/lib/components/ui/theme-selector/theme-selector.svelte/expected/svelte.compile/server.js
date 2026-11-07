import * as $ from 'svelte/internal/server';
import SunIcon from '@lucide/svelte/icons/sun';
import MoonIcon from '@lucide/svelte/icons/moon';
import { resetMode, setMode } from 'mode-watcher';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { buttonVariants } from '$lib/components/ui/button/index.js';

export default function Theme_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { variant = 'outline' } = $$props;

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: buttonVariants({ variant, size: 'icon' }),
							children: ($$renderer) => {
								SunIcon($$renderer, {
									class: 'scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90'
								});

								$$renderer.push(`<!----> `);

								MoonIcon($$renderer, {
									class: 'absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0'
								});

								$$renderer.push(`<!----> <span class="sr-only">Toggle theme</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							align: 'end',
							children: ($$renderer) => {
								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										onclick: () => setMode('light'),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Light`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										onclick: () => setMode('dark'),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Dark`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										onclick: () => resetMode(),
										children: ($$renderer) => {
											$$renderer.push(`<!---->System`);
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
	});
}