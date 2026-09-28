import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

function links($$renderer, links) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(links);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let link = each_array[$$index];

		{
			function element($$renderer, attributes) {
				$$renderer.push(`<a${$.attributes({
					...attributes,
					href: link.href,
					target: '_blank',
					rel: 'noopener noreferrer'
				})}>`);

				if (Menu.ItemText) {
					$$renderer.push('<!--[-->');

					Menu.ItemText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(link.title)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				ArrowUpRightIcon($$renderer, { class: 'size-4 opacity-60' });
				$$renderer.push(`<!----></a>`);
			}

			if (Menu.Item) {
				$$renderer.push('<!--[-->');
				Menu.Item($$renderer, { value: link.title, element, $$slots: { element: true } });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	}

	$$renderer.push(`<!--]-->`);
}

export default function Plus($$renderer) {
	const skeletonTools = [
		{
			href: 'https://themes.skeleton.dev/',
			title: 'Theme Generator'
		}
	];

	const communityTools = [
		{ href: 'https://www.etesie.dev/figma', title: 'Figma Kit' },
		{
			href: 'https://www.etesie.dev/guides/figma/01_basics',
			title: 'Figma Kit Tutorials'
		}
	];

	Menu($$renderer, {
		class: 'hidden xl:block',
		positioning: { placement: 'bottom-start' },
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					class: 'btn hover:preset-tonal data-[state=open]:preset-tonal',
					children: ($$renderer) => {
						$$renderer.push(`<span>More</span> `);
						ChevronDownIcon($$renderer, { class: 'size-4 opacity-50' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (Menu.Positioner) {
						$$renderer.push('<!--[-->');

						Menu.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Menu.Content) {
									$$renderer.push('<!--[-->');

									Menu.Content($$renderer, {
										class: 'z-50',
										children: ($$renderer) => {
											if (Menu.ItemGroup) {
												$$renderer.push('<!--[-->');

												Menu.ItemGroup($$renderer, {
													children: ($$renderer) => {
														if (Menu.ItemGroupLabel) {
															$$renderer.push('<!--[-->');

															Menu.ItemGroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Skeleton Tools`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														links($$renderer, skeletonTools);
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menu.Separator) {
												$$renderer.push('<!--[-->');
												Menu.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menu.ItemGroup) {
												$$renderer.push('<!--[-->');

												Menu.ItemGroup($$renderer, {
													children: ($$renderer) => {
														if (Menu.ItemGroupLabel) {
															$$renderer.push('<!--[-->');

															Menu.ItemGroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Community Tools`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														links($$renderer, communityTools);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}