import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { GetInitials } from "$lib/clientTools.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import mdToHTML from "$lib/marked";
import { slide } from "svelte/transition";
import { page } from "$app/state";

var root = $.from_html(`<a class="hover:underline"> </a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"><div class="flex items-center gap-3"><!> <div class="flex flex-col"><span class="font-medium"> </span> <span class="text-muted-foreground text-xs"> </span></div></div> <div class="flex items-center justify-between"><!> <!></div></div>`);
var root_3 = $.from_html(`<div class="my-1 p-1"><div class="flex flex-wrap gap-2"></div></div>`);
var root_4 = $.from_html(`<span class="max-w-full rounded-full border px-3 py-2 wrap-break-word"> </span>`);
var root_5 = $.from_html(`<span class="max-w-full rounded-full border px-3 py-2 wrap-break-word"> </span> <span class="relative w-full text-center sm:flex-1"><span class="absolute top-0 bottom-0 left-1/2 border-l sm:top-1/2 sm:right-0 sm:bottom-auto sm:left-0 sm:border-t sm:border-l-0"></span> <span class="bg-background relative z-10 rounded-full px-0 py-1 sm:px-2"> </span></span> <!>`, 1);
var root_6 = $.from_html(`<div class="my-2 grid grid-cols-1 gap-4 text-xs font-medium sm:grid-cols-3"><div class="text-muted-foreground bg-secondary flex items-center justify-between rounded-full border p-2 px-4"><span> </span> <span> </span></div> <div class="text-muted-foreground bg-secondary flex items-center justify-between rounded-full border p-2 px-4"><span> </span> <div class="flex items-center gap-2"><span> </span></div></div> <div class="text-muted-foreground bg-secondary flex items-center justify-between gap-2 rounded-full border p-2 px-4"><span> </span> <!></div></div>`);
var root_7 = $.from_html(`<div class="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"><div class="flex justify-start gap-2"><!> <span class="text-muted-foreground text-xs"> </span></div> <div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto wrap-break-word" style="font-size: 14px;"><!></div></div>`);
var root_8 = $.from_html(`<div class=" flex flex-col gap-4"></div>`);
var root_9 = $.from_html(`<div class="flex flex-col items-start justify-start gap-0.5"><span> </span> <!></div> <!> <!> <!> <!>`, 1);

export default function IncidentItem($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $formatDuration = () => $.store_get(formatDuration, '$formatDuration', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let className = $.prop($$props, 'class', 3, ""),
		hideMonitors = $.prop($$props, 'hideMonitors', 3, false),
		showComments = $.prop($$props, 'showComments', 7, true),
		showSummary = $.prop($$props, 'showSummary', 3, true);

	// Calculate duration between start and end (or now if ongoing)
	// If ongoing, use current timestamp for duration calculation
	const endTimeForDuration = $.derived(() => $$props.incident.end_date_time ?? Math.floor(Date.now() / 1000));

	const isEmbedded = page.route.id?.includes("(embed)");
	const target = isEmbedded ? "_blank" : "_self";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			get class() {
				return `items-start  p-0 ${className() ?? ''} sm:items-center`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						class: 'min-w-0 flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_9();
							var div = $.first_child(fragment_2);
							var span = $.child(div);
							var text = $.only_child(span, true);
							var node_2 = $.sibling(span, 2);

							$.component(node_2, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									class: 'min-w-0 text-base wrap-break-word break-all',
									children: ($$anchor, $$slotProps) => {
										var a = root();
										var text_1 = $.only_child(a, true);

										$.template_effect(
											($0) => {
												$.set_attribute(a, 'target', target);
												$.set_attribute(a, 'href', $0);
												$.set_text(text_1, $$props.incident.title);
											},
											[
												() => clientResolver(resolve, `/incidents/${$$props.incident.id}`)
											]
										);

										$.append($$anchor, a);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_3 = $.sibling(div, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_1 = root_3();
									var div_2 = $.child(div_1);

									$.each(div_2, 21, () => $$props.incident.monitors, (monitor) => `${$$props.incident.id}-${monitor.monitor_tag}`, ($$anchor, monitor) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Popover.Root, ($$anchor, Popover_Root) => {
											Popover_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, {
															get disabled() {
																return isEmbedded;
															},

															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => $.get(monitor).monitor_impact.toLowerCase());

																	Badge($$anchor, {
																		variant: 'outline',
																		get class() {
																			return `border-${$.get($0) ?? ''}   max-w-full cursor-pointer rounded-none border-0 border-b px-0 text-sm font-normal wrap-anywhere whitespace-normal`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, $.get(monitor).monitor_name));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
														Popover_Content($$anchor, {
															class: 'bg-background/60 border-border w-64 rounded-3xl border shadow-2xl backdrop-blur-xl',
															children: ($$anchor, $$slotProps) => {
																var div_3 = root_2();
																var div_4 = $.child(div_3);
																var node_7 = $.child(div_4);

																$.component(node_7, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																	Avatar_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_1();
																			var node_8 = $.first_child(fragment_7);

																			{
																				var consequent = ($$anchor) => {
																					var fragment_8 = $.comment();
																					var node_9 = $.first_child(fragment_8);

																					{
																						let $0 = $.derived(() => clientResolver(resolve, $.get(monitor).monitor_image));

																						$.component(node_9, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																							Avatar_Image($$anchor, {
																								get src() {
																									return $.get($0);
																								},

																								get alt() {
																									return $.get(monitor).monitor_name;
																								}
																							});
																						});
																					}

																					$.append($$anchor, fragment_8);
																				};

																				$.if(node_8, ($$render) => {
																					if ($.get(monitor).monitor_image) $$render(consequent);
																				});
																			}

																			var node_10 = $.sibling(node_8, 2);

																			$.component(node_10, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																				Avatar_Fallback($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text();

																						$.template_effect(($0) => $.set_text(text_3, $0), [() => GetInitials($.get(monitor).monitor_name)]);
																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var div_5 = $.sibling(node_7, 2);
																var span_1 = $.child(div_5);
																var text_4 = $.only_child(span_1, true);
																var span_2 = $.sibling(span_1, 2);
																var text_5 = $.only_child(span_2, true);

																$.reset(div_5);
																$.reset(div_4);

																var div_6 = $.sibling(div_4, 2);
																var node_11 = $.child(div_6);

																{
																	let $0 = $.derived(() => $.get(monitor).monitor_impact.toLowerCase());

																	Badge(node_11, {
																		variant: 'outline',
																		get class() {
																			return `text-${$.get($0) ?? ''}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text();

																			$.template_effect(($0) => $.set_text(text_6, $0), [() => $t()($.get(monitor).monitor_impact)]);
																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_12 = $.sibling(node_11, 2);

																{
																	let $0 = $.derived(() => clientResolver(resolve, `/monitors/${$.get(monitor).monitor_tag}`));

																	Button(node_12, {
																		variant: 'outline',
																		class: 'rounded-btn',
																		size: 'icon-sm',
																		get href() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			ArrowRight($$anchor, { class: 'size-3' });
																		},
																		$$slots: { default: true }
																	});
																}

																$.reset(div_6);
																$.reset(div_3);

																$.template_effect(() => {
																	$.set_text(text_4, $.get(monitor).monitor_name);
																	$.set_text(text_5, $.get(monitor).monitor_tag);
																});

																$.append($$anchor, div_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									});

									$.reset(div_2);
									$.reset(div_1);
									$.append($$anchor, div_1);
								};

								$.if(node_3, ($$render) => {
									if ($$props.incident.monitors && $$props.incident.monitors.length > 0 && !hideMonitors()) $$render(consequent_1);
								});
							}

							var node_13 = $.sibling(node_3, 2);

							$.component(node_13, () => Item.Description, ($$anchor, Item_Description) => {
								Item_Description($$anchor, {
									class: 'mt-2 flex w-full flex-col gap-2 text-xs font-medium sm:flex-row sm:items-center sm:justify-between',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_5();
										var span_3 = $.first_child(fragment_12);
										var text_7 = $.only_child(span_3, true);
										var span_4 = $.sibling(span_3, 2);
										var span_5 = $.sibling($.child(span_4), 2);
										var text_8 = $.only_child(span_5, true);

										$.reset(span_4);

										var node_14 = $.sibling(span_4, 2);

										{
											var consequent_2 = ($$anchor) => {
												var span_6 = root_4();
												var text_9 = $.only_child(span_6, true);

												$.template_effect(($0) => $.set_text(text_9, $0), [
													() => $formatDate()($$props.incident.end_date_time, page.data.dateAndTimeFormat.datePlusTime)
												]);

												$.append($$anchor, span_6);
											};

											var alternate = ($$anchor) => {
												var span_7 = root_4();
												var text_10 = $.only_child(span_7, true);

												$.template_effect(($0) => $.set_text(text_10, $0), [() => $t()("Ongoing")]);
												$.append($$anchor, span_7);
											};

											$.if(node_14, ($$render) => {
												if ($$props.incident.end_date_time) $$render(consequent_2); else $$render(alternate, -1);
											});
										}

										$.template_effect(
											($0, $1) => {
												$.set_text(text_7, $0);
												$.set_text(text_8, $1);
											},
											[
												() => $formatDate()($$props.incident.start_date_time, page.data.dateAndTimeFormat.datePlusTime),
												() => $formatDuration()($$props.incident.start_date_time, $.get(endTimeForDuration))
											]
										);

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_13, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_7 = root_6();
									var div_8 = $.child(div_7);
									var span_8 = $.child(div_8);
									var text_11 = $.only_child(span_8, true);
									var span_9 = $.sibling(span_8, 2);
									var text_12 = $.only_child(span_9, true);

									$.reset(div_8);

									var div_9 = $.sibling(div_8, 2);
									var span_10 = $.child(div_9);
									var text_13 = $.only_child(span_10, true);
									var div_10 = $.sibling(span_10, 2);
									var span_11 = $.child(div_10);
									var text_14 = $.only_child(span_11, true);

									$.reset(div_10);
									$.reset(div_9);

									var div_11 = $.sibling(div_9, 2);
									var span_12 = $.child(div_11);
									var text_15 = $.only_child(span_12, true);
									var node_16 = $.sibling(span_12, 2);

									{
										let $0 = $.derived(() => isEmbedded ? 'hidden' : '');

										Button(node_16, {
											variant: 'outline',
											size: 'icon-sm',
											get class() {
												return `rounded-btn -mr-2 ${$.get($0) ?? ''}`;
											},
											onclick: () => showComments(!showComments()),
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => `transition-transform duration-200 ${showComments() ? "rotate-90" : ""}`);

													ArrowRight($$anchor, {
														get class() {
															return $.get($0);
														}
													});
												}
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_11);
									$.reset(div_7);

									$.template_effect(
										($0, $1, $2, $3, $4, $5) => {
											$.set_text(text_11, $0);
											$.set_text(text_12, $1);
											$.set_text(text_13, $2);
											$.set_class(span_11, 1, `text-${$3 ?? ''}`);
											$.set_text(text_14, $4);
											$.set_text(text_15, $5);
										},
										[
											() => $t()("Last Updated"),
											() => $formatDate()($$props.incident.updated_at, page.data.dateAndTimeFormat.datePlusTime),
											() => $t()("Status"),
											() => $$props.incident.state.toLowerCase(),
											() => $t()($$props.incident.state),
											() => $$props.incident.comments && $$props.incident.comments.length > 0
												? `${$$props.incident.comments.length} ${$t()("Updates")}`
												: $t()("No Updates")
										]
									);

									$.append($$anchor, div_7);
								};

								$.if(node_15, ($$render) => {
									if (showSummary()) $$render(consequent_3);
								});
							}

							var node_17 = $.sibling(node_15, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_12 = root_8();

									$.each(div_12, 21, () => $$props.incident.comments, (comment) => comment.id, ($$anchor, comment) => {
										var div_13 = root_7();
										var div_14 = $.child(div_13);
										var node_18 = $.child(div_14);

										{
											let $0 = $.derived(() => $.get(comment).state.toLowerCase());

											Badge(node_18, {
												variant: 'outline',
												get class() {
													return `text-${$.get($0) ?? ''} rounded-none border-0 p-0`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text();

													$.template_effect(($0) => $.set_text(text_16, $0), [() => $t()($.get(comment).state)]);
													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										}

										var span_13 = $.sibling(node_18, 2);
										var text_17 = $.only_child(span_13, true);

										$.reset(div_14);

										var div_15 = $.sibling(div_14, 2);
										var node_19 = $.child(div_15);

										{
											let $0 = $.derived(() => mdToHTML($.get(comment).comment));

											SveltePurify(node_19, {
												get html() {
													return $.get($0);
												}
											});
										}

										$.reset(div_15);
										$.reset(div_13);

										$.template_effect(($0) => $.set_text(text_17, $0), [
											() => $formatDate()($.get(comment).commented_at, page.data.dateAndTimeFormat.datePlusTime)
										]);

										$.append($$anchor, div_13);
									});

									$.reset(div_12);
									$.transition(3, div_12, () => slide, () => ({ duration: 220 }));
									$.append($$anchor, div_12);
								};

								$.if(node_17, ($$render) => {
									if (showSummary() && showComments() && $$props.incident.comments && $$props.incident.comments.length > 0) $$render(consequent_4);
								});
							}

							$.template_effect(
								($0, $1) => {
									$.set_class(span, 1, `text-xs font-medium text-${$0 ?? ''}`);
									$.set_text(text, $1);
								},
								[
									() => $$props.incident.state.toLowerCase(),
									() => $t()($$props.incident.state)
								]
							);

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}