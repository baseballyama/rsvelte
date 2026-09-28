import * as $ from 'svelte/internal/server';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	$$renderer.push(`<div class="w-[375px] h-[200px] grid grid-rows-[1fr_auto] border border-surface-200-800"><div class="flex justify-center items-center"><p class="opacity-60">...</p></div> `);

	Navigation($$renderer, {
		layout: 'bar',
		children: ($$renderer) => {
			if (Navigation.Menu) {
				$$renderer.push('<!--[-->');

				Navigation.Menu($$renderer, {
					class: 'grid grid-cols-4 gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(links);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let link = each_array[$$index];
							const Icon = link.icon;

							if (Navigation.TriggerAnchor) {
								$$renderer.push('<!--[-->');

								Navigation.TriggerAnchor($$renderer, {
									href: link.href,
									children: ($$renderer) => {
										if (Icon) {
											$$renderer.push('<!--[-->');
											Icon($$renderer, { class: 'size-5' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Navigation.TriggerText) {
											$$renderer.push('<!--[-->');

											Navigation.TriggerText($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(link.label)}`);
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
						}

						$$renderer.push(`<!--]-->`);
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

	$$renderer.push(`<!----></div>`);
}