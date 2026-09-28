import * as $ from 'svelte/internal/server';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import SettingsIcon from '@lucide/svelte/icons/settings';
import SkullIcon from '@lucide/svelte/icons/skull';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

export default function Rail($$renderer) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	$$renderer.push(`<div class="w-full h-[640px] grid grid-cols-[auto_1fr] border border-surface-200-800">`);

	Navigation($$renderer, {
		layout: 'rail',
		children: ($$renderer) => {
			if (Navigation.Header) {
				$$renderer.push('<!--[-->');

				Navigation.Header($$renderer, {
					children: ($$renderer) => {
						if (Navigation.TriggerAnchor) {
							$$renderer.push('<!--[-->');

							Navigation.TriggerAnchor($$renderer, {
								href: '/#',
								title: 'View Homepage',
								'aria-label': 'View Homepage',
								children: ($$renderer) => {
									SkullIcon($$renderer, { class: 'size-8' });
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

			if (Navigation.Content) {
				$$renderer.push('<!--[-->');

				Navigation.Content($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Menu) {
							$$renderer.push('<!--[-->');

							Navigation.Menu($$renderer, {
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Footer) {
				$$renderer.push('<!--[-->');

				Navigation.Footer($$renderer, {
					children: ($$renderer) => {
						if (Navigation.TriggerAnchor) {
							$$renderer.push('<!--[-->');

							Navigation.TriggerAnchor($$renderer, {
								href: '/#',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$renderer) => {
									SettingsIcon($$renderer, { class: 'size-5' });
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

	$$renderer.push(`<!----> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div>`);
}