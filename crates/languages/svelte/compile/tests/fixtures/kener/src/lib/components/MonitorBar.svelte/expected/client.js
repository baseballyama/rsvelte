import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/components/ui/item/index.js";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import ICONS from "$lib/icons";
import StatusBarCalendar from "$lib/components/StatusBarCalendar.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { formatDate } from "$lib/stores/datetime";
import { GetInitials } from "$lib/clientTools.js";
import GroupMonitorPopover from "./GroupMonitorPopover.svelte";
import { t } from "$lib/stores/i18n";
import { page } from "$app/state";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="mx-auto flex w-full flex-col gap-1 px-4"><div class="flex justify-end overflow-hidden rounded-full"></div> <div class="flex justify-end"><!></div></div>`);
var root_3 = $.from_html(`<div class="text-destructive p-4 text-center"><p> </p></div>`);
var root_4 = $.from_html(`<a class="hover:underline"> </a>`);
var root_5 = $.from_html(`<!> <div class="flex flex-col items-start gap-1 sm:items-end"><span> </span> <span class="text-muted-foreground text-right text-xs"> </span></div>`, 1);
var root_6 = $.from_html(`<div class="mx-auto flex w-full flex-col gap-1 px-4"><!> <div class="flex min-w-0 justify-between gap-3"><p class="text-muted-foreground min-w-0 truncate text-xs font-medium"> </p> <p class="text-muted-foreground min-w-0 truncate text-right text-xs font-medium"> </p></div></div>`);
var root_7 = $.from_html(`<div class="mt-2 flex justify-center gap-2 px-4"><!></div>`);
var root_8 = $.from_html(`<div><!></div>`);

export default function MonitorBar($$anchor, $$props) {
	$.push($$props, true);

	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let groupChildTags = $.prop($$props, 'groupChildTags', 19, () => []),
		compact = $.prop($$props, 'compact', 3, false),
		grid = $.prop($$props, 'grid', 3, false);

	let data = $.derived(() => $$props.prefetchedData ?? null);
	let error = $.derived(() => $$props.prefetchedError ?? null);
	let loading = $.derived(() => !$.get(data) && !$.get(error));
	let showGroupPopover = $.derived(() => groupChildTags().length > 0 && typeof $$props.days === "number" && typeof $$props.endOfDayTodayAtTz === "number");

	const STATUS_ICON = {
		UP: ICONS.UP,
		DOWN: ICONS.DOWN,
		DEGRADED: ICONS.DEGRADED,
		MAINTENANCE: ICONS.MAINTENANCE,
		NO_DATA: ICONS.MAINTENANCE
	};

	const STATUS_STROKE = {
		UP: "stroke-up",
		DOWN: "stroke-down",
		DEGRADED: "stroke-degraded",
		MAINTENANCE: "stroke-maintenance",
		NO_DATA: "stroke-muted-foreground"
	};

	var div = root_8();
	var node = $.child(div);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					class: 'items-start sm:items-center',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Item.Media, ($$anchor, Item_Media) => {
									Item_Media($$anchor, {
										variant: 'image',
										children: ($$anchor, $$slotProps) => {
											Skeleton($$anchor, { class: 'size-8 rounded' });
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_2, ($$render) => {
								if (!compact()) $$render(consequent);
							});
						}

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								class: 'min-w-0 flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									Skeleton(node_5, { class: 'mb-2 h-5 w-full' });

									var node_6 = $.sibling(node_5, 2);

									Skeleton(node_6, { class: 'h-4 w-full' });
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, {
								class: 'order-3 w-full text-left sm:order-0 sm:w-auto sm:flex-none sm:text-center',
								children: ($$anchor, $$slotProps) => {
									Skeleton($$anchor, { class: 'h-8 w-full' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_1 = root_2();
					var div_2 = $.child(div_1);

					$.each(div_2, 20, () => Array(54), $.index, ($$anchor, _, i) => {
						Skeleton($$anchor, {
							class: `h-4 w-4 shrink-0 ${i === 0 ? 'rounded-tl-full rounded-bl-full' : ''} ${i === 53 ? 'rounded-tr-full rounded-br-full' : ''}`
						});
					});

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_9 = $.child(div_3);

					Skeleton(node_9, { class: 'h-3 w-32' });
					$.reset(div_3);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_8, ($$render) => {
					if (!compact()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var div_4 = root_3();
			var p = $.child(div_4);
			var text = $.only_child(p);

			$.reset(div_4);
			$.template_effect(() => $.set_text(text, `Failed to load monitor: ${$.get(error) ?? ''}`));
			$.append($$anchor, div_4);
		};

		var consequent_9 = ($$anchor) => {
			const StatusIcon = $.derived(() => STATUS_ICON[$.get(data).currentStatus]);
			var fragment_7 = root_1();
			var node_10 = $.first_child(fragment_7);

			$.component(node_10, () => Item.Root, ($$anchor, Item_Root_1) => {
				Item_Root_1($$anchor, {
					class: 'items-start ',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_1();
						var node_11 = $.first_child(fragment_8);

						{
							var consequent_5 = ($$anchor) => {
								var fragment_9 = $.comment();
								var node_12 = $.first_child(fragment_9);

								$.component(node_12, () => Item.Media, ($$anchor, Item_Media_1) => {
									Item_Media_1($$anchor, {
										variant: 'image',
										class: 'hidden sm:block',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_13 = $.first_child(fragment_10);

											$.component(node_13, () => Avatar.Root, ($$anchor, Avatar_Root) => {
												Avatar_Root($$anchor, {
													class: 'size-10',
													children: ($$anchor, $$slotProps) => {
														var fragment_11 = root();
														var node_14 = $.first_child(fragment_11);

														{
															var consequent_4 = ($$anchor) => {
																var fragment_12 = $.comment();
																var node_15 = $.first_child(fragment_12);

																{
																	let $0 = $.derived(() => clientResolver(resolve, $.get(data).image));

																	$.component(node_15, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																		Avatar_Image($$anchor, {
																			get src() {
																				return $.get($0);
																			},

																			get alt() {
																				return $.get(data).name;
																			},
																			class: '  '
																		});
																	});
																}

																$.append($$anchor, fragment_12);
															};

															$.if(node_14, ($$render) => {
																if ($.get(data).image) $$render(consequent_4);
															});
														}

														var node_16 = $.sibling(node_14, 2);

														$.component(node_16, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
															Avatar_Fallback($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(($0) => $.set_text(text_1, $0), [() => GetInitials($.get(data).name)]);
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_11);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_9);
							};

							$.if(node_11, ($$render) => {
								if (!compact()) $$render(consequent_5);
							});
						}

						var node_17 = $.sibling(node_11, 2);

						$.component(node_17, () => Item.Content, ($$anchor, Item_Content_2) => {
							Item_Content_2($$anchor, {
								class: 'min-w-0 flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root();
									var node_18 = $.first_child(fragment_14);

									$.component(node_18, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'w-full truncate',
											children: ($$anchor, $$slotProps) => {
												var a = root_4();
												var text_2 = $.only_child(a, true);

												$.template_effect(
													($0) => {
														$.set_attribute(a, 'href', $0);
														$.set_text(text_2, $.get(data).name);
													},
													[() => clientResolver(resolve, `/monitors/${$$props.tag}`)]
												);

												$.append($$anchor, a);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									{
										var consequent_6 = ($$anchor) => {
											var fragment_15 = $.comment();
											var node_20 = $.first_child(fragment_15);

											$.component(node_20, () => Item.Description, ($$anchor, Item_Description) => {
												Item_Description($$anchor, {
													class: 'line-clamp-2 wrap-break-word',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, $.get(data).description));
														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_15);
										};

										$.if(node_19, ($$render) => {
											if ($.get(data).description) $$render(consequent_6);
										});
									}

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_17, 2);

						$.component(node_21, () => Item.Content, ($$anchor, Item_Content_3) => {
							Item_Content_3($$anchor, {
								class: 'order-3 w-full text-left sm:order-0 sm:w-auto sm:flex-none sm:text-center',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = $.comment();
									var node_22 = $.first_child(fragment_17);

									$.component(node_22, () => Item.Title, ($$anchor, Item_Title_1) => {
										Item_Title_1($$anchor, {
											class: 'items-start text-2xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_5();
												var node_23 = $.first_child(fragment_18);

												{
													let $0 = $.derived(() => STATUS_STROKE[$.get(data).currentStatus]);
													let $1 = $.derived(() => grid() ? 'mt-1 size-5' : 'mt-1.5 size-6');

													$.component(node_23, () => $.get(StatusIcon), ($$anchor, StatusIcon_1) => {
														StatusIcon_1($$anchor, {
															get class() {
																return `${$.get($0) ?? ''} ${$.get($1) ?? ''}`;
															}
														});
													});
												}

												var div_5 = $.sibling(node_23, 2);
												var span = $.child(div_5);
												var text_4 = $.only_child(span);
												var span_1 = $.sibling(span, 2);
												var text_5 = $.only_child(span_1, true);

												$.reset(div_5);

												$.template_effect(() => {
													$.set_class(span, 1, $.clsx(grid() ? "text-base sm:text-lg" : "text-lg sm:text-xl"));
													$.set_text(text_4, `${$.get(data).uptime ?? ''}%`);
													$.set_text(text_5, $.get(data).avgLatency);
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			var node_24 = $.sibling(node_10, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_6 = root_6();
					var node_25 = $.child(div_6);

					StatusBarCalendar(node_25, {
						get data() {
							return $.get(data).uptimeData;
						},

						get monitorTag() {
							return $$props.tag;
						},
						barHeight: 40,
						radius: 8
					});

					var div_7 = $.sibling(node_25, 2);
					var p_1 = $.child(div_7);
					var text_6 = $.only_child(p_1, true);
					var p_2 = $.sibling(p_1, 2);
					var text_7 = $.only_child(p_2, true);

					$.reset(div_7);
					$.reset(div_6);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_6, $0);
							$.set_text(text_7, $1);
						},
						[
							() => $formatDate()(new Date($.get(data).fromTimeStamp * 1000), page.data.dateAndTimeFormat.dateOnly),
							() => $formatDate()(new Date($.get(data).toTimeStamp * 1000), page.data.dateAndTimeFormat.dateOnly)
						]
					);

					$.append($$anchor, div_6);
				};

				$.if(node_24, ($$render) => {
					if (!compact()) $$render(consequent_7);
				});
			}

			var node_26 = $.sibling(node_24, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_8 = root_7();
					var node_27 = $.child(div_8);

					GroupMonitorPopover(node_27, {
						get tags() {
							return groupChildTags();
						},

						get days() {
							return $$props.days;
						},

						get endOfDayTodayAtTz() {
							return $$props.endOfDayTodayAtTz;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(($0) => $.set_text(text_8, $0), [
								() => $t()("Included Monitors (%count)", { count: String(groupChildTags().length) })
							]);

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_26, ($$render) => {
					if ($.get(showGroupPopover)) $$render(consequent_8);
				});
			}

			$.append($$anchor, fragment_7);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent_2); else if ($.get(error)) $$render(consequent_3, 1); else if ($.get(data)) $$render(consequent_9, 2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}