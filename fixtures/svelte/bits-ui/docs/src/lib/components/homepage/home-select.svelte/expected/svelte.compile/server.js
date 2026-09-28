import * as $ from 'svelte/internal/server';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";

export default function Home_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const themes = [
			{ value: "new", label: "New App" },
			{ value: "code", label: "Code" },
			{ value: "design", label: "Design" }
		];

		let { value = "new" } = $$props;

		const selectedLabel = $.derived(() => value
			? themes.find((theme) => theme.value === value)?.label
			: "New app");

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					items: themes,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								class: 'border-border-input bg-background placeholder:text-foreground-alt/50 inline-flex h-[27px] w-full cursor-pointer select-none items-center rounded-[5px] border px-2 pr-1 text-[8px] transition-colors lg:h-[37px] lg:rounded-[9px] lg:px-3 lg:pr-2 lg:text-sm dark:border-[#18181B2B] dark:bg-white dark:text-[#171717]',
								'aria-label': 'Select task',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedLabel())} `);

									CaretUpDown($$renderer, {
										class: 'text-muted-foreground ml-auto mr-[-5px] size-3 lg:size-6 dark:text-[#17171766]'
									});

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
									if (Select.Content) {
										$$renderer.push('<!--[-->');

										Select.Content($$renderer, {
											class: 'focus-override border-muted bg-background shadow-popover outline-hidden z-50 max-h-96 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-2',
											sideOffset: 10,
											children: ($$renderer) => {
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

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let theme = each_array[$$index];

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
		$.bind_props($$props, { value });
	});
}