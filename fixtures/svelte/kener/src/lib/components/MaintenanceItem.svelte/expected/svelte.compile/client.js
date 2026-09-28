import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import STATUS_ICON from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { GetInitials } from "$lib/clientTools.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import mdToHTML from "$lib/marked";
import { page } from "$app/state";

var root = $.from_html(`<a class="hover:underline"> </a>`);
var root_1 = $.from_html(`<div class="prose prose-sm dark:prose-invert text-muted-foreground mt-1 max-w-none min-w-0 overflow-x-auto text-sm wrap-break-word"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-3"><div class="flex items-center gap-3"><!> <div class="flex flex-col"><span class="font-medium"> </span> <span class="text-muted-foreground text-xs"> </span></div></div> <div class="flex items-center justify-between"><!> <!></div></div>`);
var root_4 = $.from_html(`<div class="flex flex-wrap gap-2"></div>`);
var root_5 = $.from_html(`<span class="max-w-full rounded-full border px-3 py-2 wrap-break-word"> </span> <span class="relative w-full text-center sm:flex-1"><span class="absolute top-0 bottom-0 left-1/2 border-l sm:top-1/2 sm:right-0 sm:bottom-auto sm:left-0 sm:border-t sm:border-l-0"></span> <span class="bg-background relative z-10 rounded-full px-0 py-1 sm:px-2"> </span></span> <span class="max-w-full rounded-full border px-3 py-2 wrap-break-word"> </span>`, 1);
var root_6 = $.from_html(`<div class="flex flex-col items-start justify-start gap-0.5"><span> </span> <!></div> <!> <!> <!>`, 1);

export default function MaintenanceItem($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $formatDuration = () => $.store_get(formatDuration, '$formatDuration', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let className = $.prop($$props, 'class', 3, ""),
		hideMonitors = $.prop($$props, 'hideMonitors', 3, false);

	// Check if maintenance is ongoing (current time is between start and end)
	const isOngoing = $.derived(() => () => {
		const now = Date.now() / 1000;

		return now >= $$props.maintenance.start_date_time && now <= $$props.maintenance.end_date_time;
	});

	const isEmbedded = page.route.id?.includes("(embed)");
	const target = isEmbedded ? "_blank" : "_self";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			get class() {
				return `items-start p-0 ${className() ?? ''} sm:items-center`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						class: 'min-w-0 flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_6();
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
												$.set_text(text_1, $$props.maintenance.title);
											},
											[
												() => clientResolver(resolve, `/maintenances/${$$props.maintenance.id}`)
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
								var consequent = ($$anchor) => {
									var div_1 = root_1();
									var node_4 = $.child(div_1);

									{
										let $0 = $.derived(() => mdToHTML($$props.maintenance.description));

										SveltePurify(node_4, {
											get html() {
												return $.get($0);
											}
										});
									}

									$.reset(div_1);
									$.append($$anchor, div_1);
								};

								$.if(node_3, ($$render) => {
									if ($$props.maintenance.description) $$render(consequent);
								});
							}

							var node_5 = $.sibling(node_3, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_2 = root_4();

									$.each(div_2, 21, () => $$props.maintenance.monitors, $.index, ($$anchor, monitor) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Popover.Root, ($$anchor, Popover_Root) => {
											Popover_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_2();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
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

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content) => {
														Popover_Content($$anchor, {
															class: 'w-64',
															children: ($$anchor, $$slotProps) => {
																var div_3 = root_3();
																var div_4 = $.child(div_3);
																var node_9 = $.child(div_4);

																$.component(node_9, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																	Avatar_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_2();
																			var node_10 = $.first_child(fragment_7);

																			{
																				var consequent_1 = ($$anchor) => {
																					var fragment_8 = $.comment();
																					var node_11 = $.first_child(fragment_8);

																					{
																						let $0 = $.derived(() => clientResolver(resolve, $.get(monitor).monitor_image));

																						$.component(node_11, () => Avatar.Image, ($$anchor, Avatar_Image) => {
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

																				$.if(node_10, ($$render) => {
																					if ($.get(monitor).monitor_image) $$render(consequent_1);
																				});
																			}

																			var node_12 = $.sibling(node_10, 2);

																			$.component(node_12, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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

																var div_5 = $.sibling(node_9, 2);
																var span_1 = $.child(div_5);
																var text_4 = $.only_child(span_1, true);
																var span_2 = $.sibling(span_1, 2);
																var text_5 = $.only_child(span_2, true);

																$.reset(div_5);
																$.reset(div_4);

																var div_6 = $.sibling(div_4, 2);
																var node_13 = $.child(div_6);

																{
																	let $0 = $.derived(() => $.get(monitor).monitor_impact.toLowerCase());

																	Badge(node_13, {
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

																var node_14 = $.sibling(node_13, 2);

																{
																	let $0 = $.derived(() => clientResolver(resolve, `/monitors/${$.get(monitor).monitor_tag}`));

																	Button(node_14, {
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
									$.append($$anchor, div_2);
								};

								$.if(node_5, ($$render) => {
									if ($$props.maintenance.monitors && $$props.maintenance.monitors.length > 0 && !hideMonitors()) $$render(consequent_2);
								});
							}

							var node_15 = $.sibling(node_5, 2);

							$.component(node_15, () => Item.Description, ($$anchor, Item_Description) => {
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

										var span_6 = $.sibling(span_4, 2);
										var text_9 = $.only_child(span_6, true);

										$.template_effect(
											($0, $1, $2) => {
												$.set_text(text_7, $0);
												$.set_text(text_8, $1);
												$.set_text(text_9, $2);
											},
											[
												() => $formatDate()($$props.maintenance.start_date_time, page.data.dateAndTimeFormat.datePlusTime),
												() => $formatDuration()($$props.maintenance.start_date_time, $$props.maintenance.end_date_time),
												() => $formatDate()($$props.maintenance.end_date_time, page.data.dateAndTimeFormat.datePlusTime)
											]
										);

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(
								($0, $1) => {
									$.set_class(span, 1, `text-xs font-medium text-${$0 ?? ''}`);
									$.set_text(text, $1);
								},
								[
									() => $$props.maintenance.status.toLowerCase(),
									() => $t()($$props.maintenance.status)
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