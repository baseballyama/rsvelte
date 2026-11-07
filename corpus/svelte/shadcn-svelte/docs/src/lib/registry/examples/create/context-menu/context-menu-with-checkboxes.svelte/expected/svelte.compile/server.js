import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_checkboxes($$renderer) {
	Example($$renderer, {
		title: 'With Checkboxes',
		children: ($$renderer) => {
			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click here`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ContextMenu.Content) {
							$$renderer.push('<!--[-->');

							ContextMenu.Content($$renderer, {
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													ContextMenu.CheckboxItem($$renderer, {
														checked: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Show Bookmarks Bar`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													ContextMenu.CheckboxItem($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Show Full URLs`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													ContextMenu.CheckboxItem($$renderer, {
														checked: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Show Developer Tools`);
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