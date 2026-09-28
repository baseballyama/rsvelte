import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Dropdown_menu_checkboxes($$renderer) {
	let showStatusBar = true;
	let showActivityBar = false;
	let showPanel = false;
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

											if (DropdownMenu.Separator) {
												$$renderer.push('<!--[-->');
												DropdownMenu.Separator($$renderer, {});
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
														$$renderer.push(`<!---->Status Bar`);
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
														$$renderer.push(`<!---->Activity Bar`);
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
														$$renderer.push(`<!---->Panel`);
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