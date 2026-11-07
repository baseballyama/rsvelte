import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
import packageJson from '@skeletonlabs/skeleton/package.json';

export default function Version($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const versions = ['v4', 'v3', 'v2', 'v1'];

		Menu($$renderer, {
			class: 'hidden xl:block',
			positioning: { placement: 'bottom-end' },
			children: ($$renderer) => {
				if (Menu.Trigger) {
					$$renderer.push('<!--[-->');

					Menu.Trigger($$renderer, {
						class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2 hidden xl:flex',
						children: ($$renderer) => {
							$$renderer.push(`<span>v${$.escape(packageJson.version)}</span> `);
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
																		$$renderer.push(`<!---->Previous Versions`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <!--[-->`);

															const each_array = $.ensure_array_like(versions);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let version = each_array[$$index];

																{
																	function element($$renderer, attributes) {
																		$$renderer.push(`<a${$.attributes({
																			...attributes,
																			href: `https://${version}.skeleton.dev`,
																			target: '_blank',
																			rel: 'noopener noreferrer'
																		})}>`);

																		if (Menu.ItemText) {
																			$$renderer.push('<!--[-->');

																			Menu.ItemText($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(version)} Docs`);
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
																		Menu.Item($$renderer, { value: version, element, $$slots: { element: true } });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
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
	});
}