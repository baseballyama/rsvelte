import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from "$app/paths";
import MessageSquare from "@lucide/svelte/icons/message-square";
import Monitor from "@lucide/svelte/icons/monitor";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import mdToHTML from "$lib/marked";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import { SveltePurify } from "@humanspeak/svelte-purify";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { page } from "$app/state";

var root = $.from_html(`<meta name="description"/> <meta property="og:description"/>`, 1);
var root_1 = $.from_html(`<meta property="og:image"/> <meta name="twitter:image"/>`, 1);
var root_2 = $.from_html(`<meta property="og:title"/> <meta property="og:type" content="article"/> <meta name="twitter:card" content="summary_large_image"/> <!> <!>`, 1);
var root_3 = $.from_html(`<h1><!></h1>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<div class="text-muted-foreground p-8 text-center"><!> <p> </p></div>`);
var root_6 = $.from_html(`<div class="min-w-0 p-4"><div class="mb-2 flex items-center justify-between gap-2"><!> <span class="text-muted-foreground text-xs"> </span></div> <div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto wrap-break-word"><!></div></div>`);
var root_7 = $.from_html(`<div class="divide-y"></div>`);
var root_8 = $.from_html(`<div></div>`);
var root_9 = $.from_html(`<div class="text-xs font-medium"> </div>`);
var root_10 = $.from_html(`<!> <!>`, 1);
var root_11 = $.from_html(`<span> </span>`);
var root_12 = $.from_html(`<!> <!> <!>`, 1);
var root_13 = $.from_html(`<div class="border-b last:border-b-0"><!></div>`);
var root_14 = $.from_html(`<div class="flex flex-col gap-3"><!> <div class="flex flex-col gap-2 px-4 py-2"><!></div> <div class="grid min-w-0 gap-6 lg:grid-cols-3"><div class="min-w-0 lg:col-span-2"><div class="bg-background min-w-0 rounded-3xl border"><div class="flex items-center justify-between border-b p-4"><!></div> <!></div></div> <div class="lg:col-span-1"><div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4"><!></div> <!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root_14();

	$.head('115s2d4', ($$anchor) => {
		var fragment = root_2();
		var meta = $.first_child(fragment);
		var node = $.sibling(meta, 6);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var meta_1 = $.first_child(fragment_1);
				var meta_2 = $.sibling(meta_1, 2);

				$.template_effect(() => {
					$.set_attribute(meta_1, 'content', $$props.data.comments[0].comment);
					$.set_attribute(meta_2, 'content', $$props.data.comments[0].comment);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.data.comments.length > 0) $$render(consequent);
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

		$.template_effect(() => $.set_attribute(meta, 'content', $$props.data.incident.title + " - " + $$props.data.siteName));

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.incident.title + " - " + $$props.data.siteName;
		});

		$.append($$anchor, fragment);
	});

	var node_2 = $.child(div);

	ThemePlus(node_2, {});

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	$.component(node_3, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			class: 'mb-4 px-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						class: 'min-w-0 flex-1 px-0',
						children: ($$anchor, $$slotProps) => {
							var h1 = root_3();
							var node_5 = $.child(h1);

							$.component(node_5, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									class: 'text-3xl wrap-break-word',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $$props.data.incident.title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h1);
							$.append($$anchor, h1);
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
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node_6 = $.child(div_5);

	Badge(node_6, {
		variant: 'secondary',
		class: 'gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();
			var node_7 = $.first_child(fragment_5);

			MessageSquare(node_7, { class: 'h-3 w-3' });

			var text_1 = $.sibling(node_7);

			$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [
				() => $t()("Updates (%count)", { count: String($$props.data.comments.length) })
			]);

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_6 = root_5();
			var node_9 = $.child(div_6);

			MessageSquare(node_9, { class: 'mx-auto mb-2 h-8 w-8 opacity-50' });

			var p = $.sibling(node_9, 2);
			var text_2 = $.only_child(p, true);

			$.reset(div_6);
			$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("No updates yet")]);
			$.append($$anchor, div_6);
		};

		var alternate = ($$anchor) => {
			var div_7 = root_7();

			$.each(div_7, 21, () => $$props.data.comments, (comment) => comment.id, ($$anchor, comment) => {
				var div_8 = root_6();
				var div_9 = $.child(div_8);
				var node_10 = $.child(div_9);

				{
					let $0 = $.derived(() => $.get(comment).state.toLowerCase());

					Badge(node_10, {
						variant: 'outline',
						get class() {
							return `text-${$.get($0) ?? ''} rounded-none border-0 p-0`;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(($0) => $.set_text(text_3, $0), [() => $t()($.get(comment).state)]);
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				}

				var span = $.sibling(node_10, 2);
				var text_4 = $.only_child(span, true);

				$.reset(div_9);

				var div_10 = $.sibling(div_9, 2);
				var node_11 = $.child(div_10);

				{
					let $0 = $.derived(() => mdToHTML($.get(comment).comment));

					SveltePurify(node_11, {
						get html() {
							return $.get($0);
						}
					});
				}

				$.reset(div_10);
				$.reset(div_8);

				$.template_effect(($0) => $.set_text(text_4, $0), [
					() => $formatDate()($.get(comment).commented_at, page.data.dateAndTimeFormat.datePlusTime)
				]);

				$.append($$anchor, div_8);
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_8, ($$render) => {
			if ($$props.data.comments.length === 0) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div_4);
	$.reset(div_3);

	var div_11 = $.sibling(div_3, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var node_12 = $.child(div_13);

	Badge(node_12, {
		variant: 'secondary',
		class: 'gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_4();
			var node_13 = $.first_child(fragment_7);

			Monitor(node_13, { class: 'h-3 w-3' });

			var text_5 = $.sibling(node_13);

			$.template_effect(($0) => $.set_text(text_5, ` ${$0 ?? ''}`), [
				() => $t()("Affected Monitors (%count)", { count: String($$props.data.affectedMonitors.length) })
			]);

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_13);

	var node_14 = $.sibling(div_13, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_14 = root_5();
			var node_15 = $.child(div_14);

			Monitor(node_15, { class: 'mx-auto mb-2 h-8 w-8 opacity-50' });

			var p_1 = $.sibling(node_15, 2);
			var text_6 = $.only_child(p_1, true);

			$.reset(div_14);
			$.template_effect(($0) => $.set_text(text_6, $0), [() => $t()("No monitors affected")]);
			$.append($$anchor, div_14);
		};

		var alternate_2 = ($$anchor) => {
			var div_15 = root_8();

			$.each(div_15, 21, () => $$props.data.affectedMonitors, (monitor) => monitor.monitor_tag, ($$anchor, monitor) => {
				var div_16 = root_13();
				var node_16 = $.child(div_16);

				$.component(node_16, () => Item.Root, ($$anchor, Item_Root_1) => {
					Item_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_12();
							var node_17 = $.first_child(fragment_8);

							$.component(node_17, () => Item.Media, ($$anchor, Item_Media) => {
								Item_Media($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_18 = $.first_child(fragment_9);

										$.component(node_18, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_10();
													var node_19 = $.first_child(fragment_10);

													$.component(node_19, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
														Tooltip_Trigger($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_17 = root_8();

																$.template_effect(($0) => $.set_class(div_17, 1, `h-6 w-6 rounded-full bg-${$0 ?? ''}`), [() => $.get(monitor).monitor_impact?.toLowerCase()]);
																$.append($$anchor, div_17);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, {
															arrowClasses: 'bg-foreground',
															children: ($$anchor, $$slotProps) => {
																var div_18 = root_9();
																var text_7 = $.only_child(div_18);

																$.template_effect(($0, $1) => $.set_text(text_7, `${$0 ?? ''}: ${$1 ?? ''}`), [
																	() => $t()("Impact"),
																	() => $.get(monitor).monitor_impact || $t()("Unknown impact")
																]);

																$.append($$anchor, div_18);
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
									},
									$$slots: { default: true }
								});
							});

							var node_21 = $.sibling(node_17, 2);

							$.component(node_21, () => Item.Content, ($$anchor, Item_Content_1) => {
								Item_Content_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_10();
										var node_22 = $.first_child(fragment_11);

										$.component(node_22, () => Item.Title, ($$anchor, Item_Title_1) => {
											Item_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text();

													$.template_effect(() => $.set_text(text_8, $.get(monitor).monitor_name));
													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_22, 2);

										$.component(node_23, () => Item.Description, ($$anchor, Item_Description) => {
											Item_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_24 = $.first_child(fragment_13);

													{
														var consequent_4 = ($$anchor) => {
															var span_1 = root_11();
															var text_9 = $.only_child(span_1, true);

															$.template_effect(
																($0, $1) => {
																	$.set_class(span_1, 1, `text-${$0 ?? ''}`);
																	$.set_text(text_9, $1);
																},
																[
																	() => $.get(monitor).monitor_impact.toLowerCase(),
																	() => $t()($.get(monitor).monitor_impact)
																]
															);

															$.append($$anchor, span_1);
														};

														var alternate_1 = ($$anchor) => {
															var text_10 = $.text();

															$.template_effect(($0) => $.set_text(text_10, $0), [() => $t()("Unknown impact")]);
															$.append($$anchor, text_10);
														};

														$.if(node_24, ($$render) => {
															if ($.get(monitor).monitor_impact) $$render(consequent_4); else $$render(alternate_1, -1);
														});
													}

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_21, 2);

							$.component(node_25, () => Item.Actions, ($$anchor, Item_Actions) => {
								Item_Actions($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => clientResolver(resolve, `/monitors/${$.get(monitor).monitor_tag}`));

											Button($$anchor, {
												variant: 'outline',
												get href() {
													return $.get($0);
												},
												class: 'rounded-btn',
												size: 'icon',
												children: ($$anchor, $$slotProps) => {
													ArrowRight($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_16);
				$.append($$anchor, div_16);
			});

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		$.if(node_14, ($$render) => {
			if ($$props.data.affectedMonitors.length === 0) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}