import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/components/ui/item/index.js";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import { Button } from "$lib/components/ui/button/index.js";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import MonitorOverview from "$lib/components/MonitorOverview.svelte";
import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { resolve } from "$app/paths";
import trackEvent from "$lib/beacon";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import { page } from "$app/state";

var root = $.from_html(`<meta name="description"/> <meta property="og:description"/>`, 1);
var root_1 = $.from_html(`<meta property="og:image"/> <meta name="twitter:image"/>`, 1);
var root_2 = $.from_html(`<meta property="og:title"/> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> <!> <!>`, 1);
var root_3 = $.from_html(`<img class="aspect-auto w-12 rounded object-cover"/>`);
var root_4 = $.from_html(`<h1><!></h1>`);
var root_5 = $.from_html(` <button class="text-accent-foreground inline font-medium hover:underline"> </button>`, 1);
var root_6 = $.from_html(`<h2><!></h2>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="flex flex-col items-end gap-1"><p class="text-right text-2xl font-semibold"> </p> <p class="text-muted-foreground text-xs"> </p></div>`);
var root_9 = $.from_html(`<div class=" rounded-3xl border p-3 sm:p-4"><!></div>`);
var root_10 = $.from_html(`<div class="flex flex-col gap-3"></div>`);
var root_11 = $.from_html(`<div class="rounded-3xl border p-3 sm:p-4"><!></div>`);
var root_12 = $.from_html(`<div class="flex flex-col gap-3"><!> <div class="flex flex-col gap-2 px-4 py-2"><!> <!></div> <div class="bg-background flex flex-col justify-start gap-y-3 rounded-3xl border p-4"><div class="relative flex flex-col px-2"><h2 class="text-base font-medium"> </h2> <p class="text-muted-foreground text-xs"><span> </span></p> <!></div> <div class="flex items-center justify-between px-2"><div class="flex flex-col items-start gap-1"><p> </p> <p class="text-muted-foreground text-xs"> </p></div> <!></div></div> <!> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// State
	let descriptionExpanded = $.state(false);

	let showInlineEvents = $.derived(() => $$props.data.eventDisplaySettings?.showInlineEvents === true);

	function toggleDescription(expanded) {
		$.set(descriptionExpanded, expanded, true);
		trackEvent("monitor_description_toggled", { expanded, monitorTag: $$props.data.monitorTag });
	}

	function trackExternalLinkClick() {
		trackEvent("monitor_external_link_clicked", { monitorTag: $$props.data.monitorTag });
	}

	var div = root_12();

	$.head('b9i0il', ($$anchor) => {
		var fragment = root_2();
		var meta = $.first_child(fragment);
		var node = $.sibling(meta, 6);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var meta_1 = $.first_child(fragment_1);
				var meta_2 = $.sibling(meta_1, 2);

				$.template_effect(() => {
					$.set_attribute(meta_1, 'content', $$props.data.monitorDescription);
					$.set_attribute(meta_2, 'content', $$props.data.monitorDescription);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.data.monitorDescription) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = root_1();
				var meta_3 = $.first_child(fragment_2);
				var meta_4 = $.sibling(meta_3, 2);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(meta_3, 'content', $0);
						$.set_attribute(meta_4, 'content', $1);
					},
					[
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPreviewImage),
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPreviewImage)
					]
				);

				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if ($$props.data.socialPreviewImage) $$render(consequent_1);
			});
		}

		$.template_effect(() => $.set_attribute(meta, 'content', $$props.data.monitorName + " - " + $$props.data.siteName));

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.monitorName + " - " + $$props.data.siteName;
		});

		$.append($$anchor, fragment);
	});

	var node_2 = $.child(div);

	{
		let $0 = $.derived(() => [$$props.data.monitorTag]);

		ThemePlus(node_2, {
			get monitor_tags() {
				return $.get($0);
			},

			get embedMonitorTag() {
				return $$props.data.monitorTag;
			},

			get hideNotificationsPopover() {
				return $.get(showInlineEvents);
			}
		});
	}

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	{
		var consequent_2 = ($$anchor) => {
			var img = root_3();

			$.template_effect(
				($0) => {
					$.set_attribute(img, 'src', $0);
					$.set_attribute(img, 'alt', $$props.data.monitorName || "Monitor icon");
				},
				[() => clientResolver(resolve, $$props.data.monitorImage)]
			);

			$.append($$anchor, img);
		};

		$.if(node_3, ($$render) => {
			if ($$props.data.monitorImage) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			class: 'px-0 py-0 ',
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_7();
							var node_6 = $.first_child(fragment_4);

							{
								var consequent_3 = ($$anchor) => {
									var h1 = root_4();
									var node_7 = $.child(h1);

									$.component(node_7, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'text-3xl',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $$props.data.monitorName));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.reset(h1);
									$.append($$anchor, h1);
								};

								$.if(node_6, ($$render) => {
									if ($$props.data.monitorName) $$render(consequent_3);
								});
							}

							var node_8 = $.sibling(node_6, 2);

							{
								var consequent_6 = ($$anchor) => {
									var h2 = root_6();
									var node_9 = $.child(h2);

									{
										let $0 = $.derived(() => $.get(descriptionExpanded) ? 'line-clamp-none' : '');

										$.component(node_9, () => Item.Description, ($$anchor, Item_Description) => {
											Item_Description($$anchor, {
												get class() {
													return `text-muted-foreground w-full ${$.get($0) ?? ''} text-pretty`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_10 = $.first_child(fragment_6);

													{
														var consequent_4 = ($$anchor) => {
															var fragment_7 = root_5();
															var text_1 = $.first_child(fragment_7);
															var button = $.sibling(text_1);
															var text_2 = $.only_child(button, true);

															$.template_effect(
																($0, $1) => {
																	$.set_text(text_1, `${$0 ?? ''}... `);
																	$.set_text(text_2, $1);
																},
																[
																	() => $$props.data.monitorDescription.slice(0, 150),
																	() => $t()("Read more")
																]
															);

															$.delegated('click', button, () => toggleDescription(true));
															$.append($$anchor, fragment_7);
														};

														var consequent_5 = ($$anchor) => {
															var fragment_8 = root_5();
															var text_3 = $.first_child(fragment_8);
															var button_1 = $.sibling(text_3);
															var text_4 = $.only_child(button_1, true);

															$.template_effect(
																($0) => {
																	$.set_text(text_3, `${$$props.data.monitorDescription ?? ''} `);
																	$.set_text(text_4, $0);
																},
																[() => $t()("Read less")]
															);

															$.delegated('click', button_1, () => toggleDescription(false));
															$.append($$anchor, fragment_8);
														};

														var alternate = ($$anchor) => {
															var text_5 = $.text();

															$.template_effect(() => $.set_text(text_5, $$props.data.monitorDescription));
															$.append($$anchor, text_5);
														};

														$.if(node_10, ($$render) => {
															if ($$props.data.monitorDescription.length > 150 && !$.get(descriptionExpanded)) $$render(consequent_4); else if ($$props.data.monitorDescription.length > 150) $$render(consequent_5, 1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});
									}

									$.reset(h2);
									$.append($$anchor, h2);
								};

								$.if(node_8, ($$render) => {
									if ($$props.data.monitorDescription) $$render(consequent_6);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var h2_1 = $.child(div_3);
	var text_6 = $.only_child(h2_1, true);
	var p = $.sibling(h2_1, 2);
	var span = $.child(p);
	var text_7 = $.only_child(span, true);

	$.reset(p);

	var node_11 = $.sibling(p, 2);

	{
		var consequent_7 = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				size: 'icon-sm',
				class: 'rounded-btn absolute top-0 right-0',
				get href() {
					return $$props.data.externalUrl;
				},
				target: '_blank',
				rel: 'noopener noreferrer',
				onclick: trackExternalLinkClick,
				children: ($$anchor, $$slotProps) => {
					ArrowUpRight($$anchor, { class: 'size-4' });
				},
				$$slots: { default: true }
			});
		};

		$.if(node_11, ($$render) => {
			if (!!$$props.data.externalUrl) $$render(consequent_7);
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var p_1 = $.child(div_5);
	var text_8 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_9 = $.only_child(p_2, true);

	$.reset(div_5);

	var node_12 = $.sibling(div_5, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_6 = root_8();
			var p_3 = $.child(div_6);
			var text_10 = $.only_child(p_3, true);
			var p_4 = $.sibling(p_3, 2);
			var text_11 = $.only_child(p_4, true);

			$.reset(div_6);

			$.template_effect(
				($0) => {
					$.set_text(text_10, $$props.data.monitorLastLatency);
					$.set_text(text_11, $0);
				},
				[() => $t()("Latest Latency")]
			);

			$.append($$anchor, div_6);
		};

		$.if(node_12, ($$render) => {
			if (!!$$props.data.monitorLastLatency) $$render(consequent_8);
		});
	}

	$.reset(div_4);
	$.reset(div_2);

	var node_13 = $.sibling(div_2, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_7 = root_10();

			$.each(div_7, 23, () => $$props.data.ongoingIncidents, (incident, i) => incident.id ?? i, ($$anchor, incident) => {
				var div_8 = root_9();
				var node_14 = $.child(div_8);

				IncidentItem(node_14, {
					get incident() {
						return $.get(incident);
					}
				});

				$.reset(div_8);
				$.append($$anchor, div_8);
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_13, ($$render) => {
			if ($.get(showInlineEvents) && $$props.data.ongoingIncidents && $$props.data.ongoingIncidents.length > 0) $$render(consequent_9);
		});
	}

	var node_15 = $.sibling(node_13, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_9 = root_10();

			$.each(div_9, 23, () => $$props.data.ongoingMaintenances, (maintenance, i) => maintenance.id ?? i, ($$anchor, maintenance) => {
				var div_10 = root_11();
				var node_16 = $.child(div_10);

				MaintenanceItem(node_16, {
					get maintenance() {
						return $.get(maintenance);
					}
				});

				$.reset(div_10);
				$.append($$anchor, div_10);
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_15, ($$render) => {
			if ($.get(showInlineEvents) && $$props.data.ongoingMaintenances && $$props.data.ongoingMaintenances.length > 0) $$render(consequent_10);
		});
	}

	var node_17 = $.sibling(node_15, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_11 = root_10();

			$.each(div_11, 23, () => $$props.data.upcomingMaintenances, (maintenance, i) => maintenance.id ?? i, ($$anchor, maintenance) => {
				var div_12 = root_11();
				var node_18 = $.child(div_12);

				MaintenanceItem(node_18, {
					get maintenance() {
						return $.get(maintenance);
					}
				});

				$.reset(div_12);
				$.append($$anchor, div_12);
			});

			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_17, ($$render) => {
			if ($.get(showInlineEvents) && $$props.data.upcomingMaintenances && $$props.data.upcomingMaintenances.length > 0) $$render(consequent_11);
		});
	}

	var node_19 = $.sibling(node_17, 2);

	{
		let $0 = $.derived(() => $$props.data.extendedTags || []);

		MonitorOverview(node_19, {
			get monitorTag() {
				return $$props.data.monitorTag;
			},

			get maxDays() {
				return $$props.data.maxDays;
			},

			get groupTags() {
				return $.get($0);
			},
			class: 'mb-4'
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text_6, $0);
			$.set_text(text_7, $1);
			$.set_class(p_1, 1, `text-muted-foreground text-2xl font-semibold ${$$props.data.textClass ?? ''}`);
			$.set_text(text_8, $2);
			$.set_text(text_9, $3);
		},
		[
			() => $t()("Last Updated"),
			() => $formatDate()($$props.data.monitorLastStatusTimestamp * 1000, page.data.dateAndTimeFormat.datePlusTime),
			() => $t()($$props.data.monitorLastStatus),
			() => $t()("Latest Status")
		]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);