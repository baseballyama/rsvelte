import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Dropdown_menu_radio_group($$renderer) {
	let position = "bottom";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Open`);
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
							class: 'w-56',
							children: ($$renderer) => {
								if (DropdownMenu.Group) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Group($$renderer, {
										children: ($$renderer) => {
											if (DropdownMenu.Label) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Panel Position`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (DropdownMenu.Separator) {
												$$renderer.push('<!--[-->');
												DropdownMenu.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (DropdownMenu.RadioGroup) {
												$$renderer.push('<!--[-->');

												DropdownMenu.RadioGroup($$renderer, {
													get value() {
														return position;
													},

													set value($$value) {
														position = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (DropdownMenu.RadioItem) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioItem($$renderer, {
																value: 'top',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Top`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.RadioItem) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioItem($$renderer, {
																value: 'bottom',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Bottom`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.RadioItem) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioItem($$renderer, {
																value: 'right',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Right`);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}