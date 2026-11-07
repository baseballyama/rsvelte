import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Nav_main($$renderer, $$props) {
	let { items } = $$props;

	if (Sidebar.Group) {
		$$renderer.push('<!--[-->');

		Sidebar.Group($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.GroupContent) {
					$$renderer.push('<!--[-->');

					Sidebar.GroupContent($$renderer, {
						children: ($$renderer) => {
							if (Sidebar.GroupLabel) {
								$$renderer.push('<!--[-->');

								Sidebar.GroupLabel($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Home`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Sidebar.Menu) {
								$$renderer.push('<!--[-->');

								Sidebar.Menu($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(items);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let item = each_array[$$index];

											if (Sidebar.MenuItem) {
												$$renderer.push('<!--[-->');

												Sidebar.MenuItem($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.MenuButton) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuButton($$renderer, {
																tooltipContent: item.title,
																children: ($$renderer) => {
																	if (item.icon) {
																		$$renderer.push('<!--[0-->');

																		if (item.icon) {
																			$$renderer.push('<!--[-->');
																			item.icon($$renderer, {});
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> <span>${$.escape(item.title)}</span>`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}