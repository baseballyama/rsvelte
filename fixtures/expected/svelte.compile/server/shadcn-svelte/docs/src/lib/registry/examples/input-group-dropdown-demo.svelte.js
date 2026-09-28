import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

export default function Input_group_dropdown_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Enter file name' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							if (DropdownMenu.Root) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															'aria-label': 'More',
															size: 'icon-xs',
															children: ($$renderer) => {
																MoreHorizontalIcon($$renderer, {});
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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
												align: 'end',
												children: ($$renderer) => {
													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Settings`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Copy path`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open location`);
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

	$$renderer.push(` `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			class: '[--radius:1rem]',
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Enter search query' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							if (DropdownMenu.Root) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															class: '!pe-1.5 text-xs',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Search In... `);
																ChevronDownIcon($$renderer, { class: 'size-3' });
																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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
												align: 'end',
												class: '[--radius:0.95rem]',
												children: ($$renderer) => {
													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Documentation`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Blog Posts`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Changelog`);
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

	$$renderer.push(`</div>`);
}