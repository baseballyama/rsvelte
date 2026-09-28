import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_checkboxes($$renderer) {
	let showStatusBar = true;
	let showActivityBar = false;
	let showPanel = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Checkboxes',
			children: ($$renderer) => {
				if (DropdownMenu.Root) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'w-fit' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->Checkboxes`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (DropdownMenu.Trigger) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, {
									class: 'min-w-40',
									children: ($$renderer) => {
										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Appearance`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															get checked() {
																return showStatusBar;
															},

															set checked($$value) {
																showStatusBar = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'LayoutIcon',
																	tabler: 'IconLayout',
																	hugeicons: 'LayoutIcon',
																	phosphor: 'LayoutIcon',
																	remixicon: 'RiLayoutLine'
																});

																$$renderer.push(`<!----> Status Bar`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															disabled: true,
															get checked() {
																return showActivityBar;
															},

															set checked($$value) {
																showActivityBar = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ActivityIcon',
																	tabler: 'IconActivity',
																	hugeicons: 'ActivityIcon',
																	phosphor: 'PulseIcon',
																	remixicon: 'RiPulseLine'
																});

																$$renderer.push(`<!----> Activity Bar`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															get checked() {
																return showPanel;
															},

															set checked($$value) {
																showPanel = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'PanelLeftIcon',
																	tabler: 'IconLayoutSidebar',
																	hugeicons: 'LayoutLeftIcon',
																	phosphor: 'SidebarIcon',
																	remixicon: 'RiSideBarLine'
																});

																$$renderer.push(`<!----> Panel`);
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

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}