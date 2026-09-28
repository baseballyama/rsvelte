import * as $ from 'svelte/internal/server';
import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

export default function Toggle($$renderer) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	const buttonClasses = 'btn hover:preset-tonal';
	let anchorRail = `${buttonClasses} aspect-square w-full max-w-[84px] flex flex-col items-center gap-0.5`;
	let anchorSidebar = `${buttonClasses} justify-start px-2 w-full`;
	let layoutRail = true;

	function toggleLayout() {
		layoutRail = !layoutRail;
	}

	$$renderer.push(`<div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800">`);

	Navigation($$renderer, {
		layout: layoutRail ? 'rail' : 'sidebar',
		class: layoutRail ? '' : 'grid grid-rows-[1fr_auto] gap-4',
		children: ($$renderer) => {
			if (Navigation.Content) {
				$$renderer.push('<!--[-->');

				Navigation.Content($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Header) {
							$$renderer.push('<!--[-->');

							Navigation.Header($$renderer, {
								children: ($$renderer) => {
									if (Navigation.Trigger) {
										$$renderer.push('<!--[-->');

										Navigation.Trigger($$renderer, {
											onclick: toggleLayout,
											children: ($$renderer) => {
												ArrowLeftRightIcon($$renderer, { class: layoutRail ? 'size-5' : 'size-4' });
												$$renderer.push(`<!----> `);

												if (!layoutRail) {
													$$renderer.push(`<!--[0--><span>Resize</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
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
												children: ($$renderer) => {
													if (Icon) {
														$$renderer.push('<!--[-->');
														Icon($$renderer, { class: layoutRail ? 'size-5' : 'size-4' });
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex justify-center items-center"><pre class="pre">Layout: ${$.escape(layoutRail ? 'Rail' : 'Sidebar')}</pre></div></div>`);
}