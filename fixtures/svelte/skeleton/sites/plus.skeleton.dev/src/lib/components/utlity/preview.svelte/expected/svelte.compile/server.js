import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import Code from '../code/code.svelte';
import DecorStripes from '../layout/decor-stripes.svelte';
import CopyIcon from '@lucide/svelte/icons/copy';
import LockIcon from '@lucide/svelte/icons/lock';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';
import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			title = '(Title Missing)',
			code = '(Code Missing)',
			lang,
			locked = false,
			children
		} = $$props;

		let view = 'preview';
		let mode = null;
		let copied = false;

		// Default OS preference, keep in sync with OS changes.
		async function copyCode() {
			if (!code) return;

			await navigator.clipboard.writeText(code);
			copied = true;
		}

		$$renderer.push(`<div class="space-y-4"><header class="flex justify-between items-center gap-4"><div class="flex items-center gap-2"><h2 class="text-xl font-medium">${$.escape(title)}</h2> `);

		if (locked) {
			$$renderer.push(`<!--[0--><span class="badge preset-tonal">Preview</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2">`);

		SegmentedControl($$renderer, {
			value: mode,
			onValueChange: (details) => mode = details.value ?? 'light',
			class: 'hidden md:block',
			children: ($$renderer) => {
				if (SegmentedControl.Control) {
					$$renderer.push('<!--[-->');

					SegmentedControl.Control($$renderer, {
						class: 'p-1',
						children: ($$renderer) => {
							if (SegmentedControl.Indicator) {
								$$renderer.push('<!--[-->');
								SegmentedControl.Indicator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'light',
									class: 'btn-xs',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													SunIcon($$renderer, { class: 'size-elem-xs' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'dark',
									class: 'btn-xs',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													MoonIcon($$renderer, { class: 'size-elem-xs' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

		$$renderer.push(`<!----> <span class="vr hidden md:inline-block"></span> `);

		if (!locked) {
			$$renderer.push('<!--[0-->');

			SegmentedControl($$renderer, {
				value: view,
				onValueChange: (details) => view = details.value ?? 'preview',
				children: ($$renderer) => {
					if (SegmentedControl.Control) {
						$$renderer.push('<!--[-->');

						SegmentedControl.Control($$renderer, {
							class: 'p-1',
							children: ($$renderer) => {
								if (SegmentedControl.Indicator) {
									$$renderer.push('<!--[-->');
									SegmentedControl.Indicator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (SegmentedControl.Item) {
									$$renderer.push('<!--[-->');

									SegmentedControl.Item($$renderer, {
										value: 'preview',
										class: 'btn-xs',
										children: ($$renderer) => {
											if (SegmentedControl.ItemText) {
												$$renderer.push('<!--[-->');

												SegmentedControl.ItemText($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Preview`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (SegmentedControl.ItemHiddenInput) {
												$$renderer.push('<!--[-->');
												SegmentedControl.ItemHiddenInput($$renderer, {});
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

								if (SegmentedControl.Item) {
									$$renderer.push('<!--[-->');

									SegmentedControl.Item($$renderer, {
										value: 'code',
										class: 'btn-xs',
										children: ($$renderer) => {
											if (SegmentedControl.ItemText) {
												$$renderer.push('<!--[-->');

												SegmentedControl.ItemText($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Code`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (SegmentedControl.ItemHiddenInput) {
												$$renderer.push('<!--[-->');
												SegmentedControl.ItemHiddenInput($$renderer, {});
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

			$$renderer.push(`<!----> <span class="vr"></span> <button type="button" class="btn-icon preset-outlined-surface-200-800 hover:preset-tonal" title="Copy Code" aria-label="Copy Code">`);

			if (copied) {
				$$renderer.push('<!--[0-->');
				ThumbsUpIcon($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				CopyIcon($$renderer, {});
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attr('href', resolve('/overview/pricing'))} class="btn preset-tonal">`);
			LockIcon($$renderer, {});
			$$renderer.push(`<!----> <span>Unlock Block</span></a>`);
		}

		$$renderer.push(`<!--]--></div></header> `);

		if (view === 'preview') {
			$$renderer.push('<!--[0-->');

			DecorStripes($$renderer, {
				class: [
					'card border border-surface-200-800 preset-filled-surface-50-950 flex justify-center items-center p-4 md:p-8',
					{
						'scheme-light': mode === 'light',
						'scheme-dark': mode === 'dark'
					}
				],

				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
			Code($$renderer, { code, lang });
		}

		$$renderer.push(`<!--]--></div>`);
	});
}