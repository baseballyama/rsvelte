import * as $ from 'svelte/internal/server';
import { Tooltip, Toolbar, Separator } from "bits-ui";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";
import TextAlignLeft from "phosphor-svelte/lib/TextAlignLeft";
import TextAlignCenter from "phosphor-svelte/lib/TextAlignCenter";
import TextAlignRight from "phosphor-svelte/lib/TextAlignRight";
import Sparkle from "phosphor-svelte/lib/Sparkle";

function tooltipContent($$renderer, { content }) {
	if (Tooltip.Content) {
		$$renderer.push('<!--[-->');

		Tooltip.Content($$renderer, {
			class: 'rounded-input border-dark-10 bg-background shadow-popover outline-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin) z-0 flex items-center justify-center border p-3 text-sm font-medium',
			sideOffset: 8,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(content)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

export default function Tooltip_demo_group($$renderer) {
	let text = [];
	let align = "center";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 200,
				children: ($$renderer) => {
					if (Toolbar.Root) {
						$$renderer.push('<!--[-->');

						Toolbar.Root($$renderer, {
							class: 'rounded-10px border-border bg-background-alt shadow-mini flex h-12 min-w-max items-center justify-center border px-[4px] py-1',
							children: ($$renderer) => {
								if (Toolbar.Group) {
									$$renderer.push('<!--[-->');

									Toolbar.Group($$renderer, {
										type: 'multiple',
										class: 'flex items-center gap-x-0.5',
										get value() {
											return text;
										},

										set value($$value) {
											text = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Tooltip.Root) {
												$$renderer.push('<!--[-->');

												Tooltip.Root($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																const { "data-state": _state, ...rest } = props;

																if (Toolbar.GroupItem) {
																	$$renderer.push('<!--[-->');

																	Toolbar.GroupItem($$renderer, $.spread_props([
																		{
																			'aria-label': 'toggle bold',
																			value: 'bold',
																			class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																		},
																		rest,
																		{
																			children: ($$renderer) => {
																				TextB($$renderer, { class: 'size-6' });
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

															if (Tooltip.Trigger) {
																$$renderer.push('<!--[-->');
																Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);
														tooltipContent($$renderer, { content: "Bold" });
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

											if (Tooltip.Root) {
												$$renderer.push('<!--[-->');

												Tooltip.Root($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																const { "data-state": _state, ...rest } = props;

																if (Toolbar.GroupItem) {
																	$$renderer.push('<!--[-->');

																	Toolbar.GroupItem($$renderer, $.spread_props([
																		{
																			'aria-label': 'toggle italic',
																			value: 'italic',
																			class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																		},
																		rest,
																		{
																			children: ($$renderer) => {
																				TextItalic($$renderer, { class: 'size-6' });
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

															if (Tooltip.Trigger) {
																$$renderer.push('<!--[-->');
																Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);
														tooltipContent($$renderer, { content: "Italic" });
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

											if (Tooltip.Root) {
												$$renderer.push('<!--[-->');

												Tooltip.Root($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																const { "data-state": _state, ...rest } = props;

																if (Toolbar.GroupItem) {
																	$$renderer.push('<!--[-->');

																	Toolbar.GroupItem($$renderer, $.spread_props([
																		{
																			'aria-label': 'toggle strikethrough',
																			value: 'strikethrough',
																			class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]'
																		},
																		rest,
																		{
																			children: ($$renderer) => {
																				TextStrikethrough($$renderer, { class: 'size-6' });
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

															if (Tooltip.Trigger) {
																$$renderer.push('<!--[-->');
																Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);
														tooltipContent($$renderer, { content: "Strikethrough" });
														$$renderer.push(`<!---->`);
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

								if (Separator.Root) {
									$$renderer.push('<!--[-->');
									Separator.Root($$renderer, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.Group) {
									$$renderer.push('<!--[-->');

									Toolbar.Group($$renderer, {
										type: 'single',
										class: 'flex items-center gap-x-0.5',
										get value() {
											return align;
										},

										set value($$value) {
											align = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Toolbar.GroupItem) {
												$$renderer.push('<!--[-->');

												Toolbar.GroupItem($$renderer, {
													'aria-label': 'align left',
													value: 'left',
													class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
													children: ($$renderer) => {
														TextAlignLeft($$renderer, { class: 'size-6' });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Toolbar.GroupItem) {
												$$renderer.push('<!--[-->');

												Toolbar.GroupItem($$renderer, {
													'aria-label': 'align center',
													value: 'center',
													class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
													children: ($$renderer) => {
														TextAlignCenter($$renderer, { class: 'size-6' });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Toolbar.GroupItem) {
												$$renderer.push('<!--[-->');

												Toolbar.GroupItem($$renderer, {
													'aria-label': 'align right',
													value: 'right',
													class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
													children: ($$renderer) => {
														TextAlignRight($$renderer, { class: 'size-6' });
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

								if (Separator.Root) {
									$$renderer.push('<!--[-->');
									Separator.Root($$renderer, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <div class="flex items-center">`);

								if (Toolbar.Button) {
									$$renderer.push('<!--[-->');

									Toolbar.Button($$renderer, {
										class: 'rounded-9px text-foreground/80 hover:bg-muted active:bg-dark-10 inline-flex items-center justify-center  px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											Sparkle($$renderer, { class: 'mr-2 size-6' });
											$$renderer.push(`<!----> <span>Ask AI</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div>`);
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