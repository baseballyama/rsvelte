import * as $ from 'svelte/internal/server';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Palette from "phosphor-svelte/lib/Palette";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import { fly } from "svelte/transition";

export default function Select_demo_transition($$renderer) {
	const themes = [
		{ value: "light-monochrome", label: "Light Monochrome" },
		{ value: "dark-green", label: "Dark Green" },
		{ value: "svelte-orange", label: "Svelte Orange" },
		{ value: "punk-pink", label: "Punk Pink" },
		{ value: "ocean-blue", label: "Ocean Blue" },
		{ value: "sunset-red", label: "Sunset Red" },
		{ value: "forest-green", label: "Forest Green" },
		{ value: "lavender-purple", label: "Lavender Purple" },
		{ value: "mustard-yellow", label: "Mustard Yellow" },
		{ value: "slate-gray", label: "Slate Gray" },
		{ value: "neon-green", label: "Neon Green" },
		{ value: "coral-reef", label: "Coral Reef" },
		{ value: "midnight-blue", label: "Midnight Blue" },
		{ value: "crimson-red", label: "Crimson Red" },
		{ value: "mint-green", label: "Mint Green" },
		{ value: "pastel-pink", label: "Pastel Pink" },
		{ value: "golden-yellow", label: "Golden Yellow" },
		{ value: "deep-purple", label: "Deep Purple" },
		{ value: "turquoise-blue", label: "Turquoise Blue" },
		{ value: "burnt-orange", label: "Burnt Orange" }
	];

	if (Select.Root) {
		$$renderer.push('<!--[-->');

		Select.Root($$renderer, {
			type: 'single',
			items: themes,
			children: ($$renderer) => {
				if (Select.Trigger) {
					$$renderer.push('<!--[-->');

					Select.Trigger($$renderer, {
						class: 'h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors',
						'aria-label': 'Select a theme',
						children: ($$renderer) => {
							Palette($$renderer, { class: 'text-muted-foreground mr-[9px] size-6' });
							$$renderer.push(`<!----> `);

							if (Select.Value) {
								$$renderer.push('<!--[-->');
								Select.Value($$renderer, { placeholder: 'Select a theme' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);
							CaretUpDown($$renderer, { class: 'text-muted-foreground ml-auto size-6' });
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

				if (Select.Portal) {
					$$renderer.push('<!--[-->');

					Select.Portal($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { wrapperProps, props, open }) {
									if (open) {
										$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>`);

										if (Select.ScrollUpButton) {
											$$renderer.push('<!--[-->');

											Select.ScrollUpButton($$renderer, {
												class: 'flex w-full items-center justify-center',
												children: ($$renderer) => {
													CaretDoubleUp($$renderer, { class: 'size-3' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Viewport) {
											$$renderer.push('<!--[-->');

											Select.Viewport($$renderer, {
												class: 'p-1',
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(themes);

													for (let i = 0, $$length = each_array.length; i < $$length; i++) {
														let theme = each_array[i];

														{
															function children($$renderer, { selected }) {
																$$renderer.push(`<!---->${$.escape(theme.label)} `);

																if (selected) {
																	$$renderer.push(`<!--[0--><div class="ml-auto">`);
																	Check($$renderer, {});
																	$$renderer.push(`<!----></div>`);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
															}

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize duration-75',
																	value: theme.value,
																	label: theme.label,
																	children,
																	$$slots: { default: true }
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

										$$renderer.push(` `);

										if (Select.ScrollDownButton) {
											$$renderer.push('<!--[-->');

											Select.ScrollDownButton($$renderer, {
												class: 'flex w-full items-center justify-center',
												children: ($$renderer) => {
													CaretDoubleDown($$renderer, { class: 'size-3' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										class: 'focus-override border-muted bg-background shadow-popover outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3',
										sideOffset: 10,
										forceMount: true,
										child,
										$$slots: { child: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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