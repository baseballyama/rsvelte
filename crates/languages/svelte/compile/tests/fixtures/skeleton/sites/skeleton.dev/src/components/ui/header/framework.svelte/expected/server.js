import * as $ from 'svelte/internal/server';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Framework($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { url, frameworks, activeFramework } = $$props;

		Menu($$renderer, {
			positioning: { placement: 'bottom-end' },
			closeOnSelect: false,
			children: ($$renderer) => {
				if (Menu.Trigger) {
					$$renderer.push('<!--[-->');

					Menu.Trigger($$renderer, {
						class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2',
						children: ($$renderer) => {
							$$renderer.push(`<img${$.attr('src', activeFramework.data.logo)}${$.attr('alt', activeFramework.data.name)} class="size-4 grayscale"/> <span class="hidden xl:inline">${$.escape(activeFramework.data.name)}</span> `);
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
																		$$renderer.push(`<!---->Select Framework`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <!--[-->`);

															const each_array = $.ensure_array_like(frameworks);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let framework = each_array[$$index];

																{
																	function element($$renderer, attributes) {
																		$$renderer.push(`<a${$.attributes({
																			...attributes,
																			href: url.pathname.replace(activeFramework.id, framework.id),
																			'aria-current': activeFramework.id === framework.id ? 'page' : undefined,
																			'data-astro-history': 'replace'
																		})}>`);

																		if (Menu.ItemText) {
																			$$renderer.push('<!--[-->');

																			Menu.ItemText($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(framework.data.name)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Menu.ItemIndicator) {
																			$$renderer.push('<!--[-->');

																			Menu.ItemIndicator($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<img${$.attr('src', framework.data.logo)}${$.attr('alt', framework.data.name)} class="size-5 grayscale"/>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(`</a>`);
																	}

																	if (Menu.Item) {
																		$$renderer.push('<!--[-->');

																		Menu.Item($$renderer, {
																			class: 'aria-[current=page]:preset-filled mt-1',
																			value: framework.id,
																			element,
																			$$slots: { element: true }
																		});

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