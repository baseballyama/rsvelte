import * as $ from 'svelte/internal/server';
import IconCheck from "@tabler/icons-svelte/icons/check";
import IconCopy from "@tabler/icons-svelte/icons/copy";
import IconInfoCircle from "@tabler/icons-svelte/icons/info-circle";
import IconStar from "@tabler/icons-svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";

export default function Input_group_button_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isFavorite = false;
		const clipboard = new UseClipboard();

		$$renderer.push(`<div class="grid w-full max-w-sm gap-6">`);

		if (InputGroup.Root) {
			$$renderer.push('<!--[-->');

			InputGroup.Root($$renderer, {
				children: ($$renderer) => {
					if (InputGroup.Input) {
						$$renderer.push('<!--[-->');
						InputGroup.Input($$renderer, { placeholder: 'https://x.com/shadcn', readonly: true });
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
								if (InputGroup.Button) {
									$$renderer.push('<!--[-->');

									InputGroup.Button($$renderer, {
										'aria-label': 'Copy',
										title: 'Copy',
										size: 'icon-xs',
										onclick: () => clipboard.copy("https://x.com/shadcn"),
										children: ($$renderer) => {
											if (clipboard.copied) {
												$$renderer.push('<!--[0-->');
												IconCheck($$renderer, {});
											} else {
												$$renderer.push('<!--[-1-->');
												IconCopy($$renderer, {});
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

		$$renderer.push(` `);

		if (InputGroup.Root) {
			$$renderer.push('<!--[-->');

			InputGroup.Root($$renderer, {
				class: '[--radius:9999px]',
				children: ($$renderer) => {
					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										if (InputGroup.Addon) {
											$$renderer.push('<!--[-->');

											InputGroup.Addon($$renderer, {
												children: ($$renderer) => {
													if (InputGroup.Button) {
														$$renderer.push('<!--[-->');

														InputGroup.Button($$renderer, $.spread_props([
															props,
															{
																variant: 'secondary',
																size: 'icon-xs',
																children: ($$renderer) => {
																	IconInfoCircle($$renderer, {});
																},
																$$slots: { default: true }
															}
														]));

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

									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');
										Popover.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										align: 'start',
										class: 'flex flex-col gap-1 rounded-xl text-sm',
										children: ($$renderer) => {
											$$renderer.push(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`);
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

					if (InputGroup.Addon) {
						$$renderer.push('<!--[-->');

						InputGroup.Addon($$renderer, {
							class: 'ps-1.5 text-muted-foreground',
							children: ($$renderer) => {
								if (InputGroup.Text) {
									$$renderer.push('<!--[-->');

									InputGroup.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->https://`);
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

					if (InputGroup.Input) {
						$$renderer.push('<!--[-->');
						InputGroup.Input($$renderer, {});
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
								if (InputGroup.Button) {
									$$renderer.push('<!--[-->');

									InputGroup.Button($$renderer, {
										onclick: () => isFavorite = !isFavorite,
										size: 'icon-xs',
										children: ($$renderer) => {
											IconStar($$renderer, { class: isFavorite ? "fill-blue-600 stroke-blue-600" : "" });
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
				children: ($$renderer) => {
					if (InputGroup.Input) {
						$$renderer.push('<!--[-->');
						InputGroup.Input($$renderer, { placeholder: 'Type to search...' });
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
								if (InputGroup.Button) {
									$$renderer.push('<!--[-->');

									InputGroup.Button($$renderer, {
										variant: 'secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Search`);
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
	});
}