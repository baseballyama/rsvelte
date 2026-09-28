import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import * as Drawer from "$lib/components/ui/drawer/index.js";
import { requestMonitorBar } from "$lib/client/monitor-bar-client";
import MonitorBar from "$lib/components/MonitorBar.svelte";
import { t } from "$lib/stores/i18n";

var root = $.from_html(`<div class="text-muted-foreground p-4 text-sm"> </div>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <div class="scrollbar-hidden flex flex-col overflow-y-auto px-4 pb-4"><!></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="w-full"><!></div>`);

export default function GroupMonitorPopover($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isOpen = $.state(false);

	let monitorBarPromiseByTag = $.derived(() => {
		if (!browser || !$.get(isOpen) || $$props.tags.length === 0) {
			return {};
		}

		return Object.fromEntries($$props.tags.map((tag) => [
			tag,
			requestMonitorBar(tag, $$props.days, $$props.endOfDayTodayAtTz)
		]));
	});

	var div = root_4();
	var node = $.child(div);

	$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
		Drawer_Root($$anchor, {
			direction: 'bottom',
			get open() {
				return $.get(isOpen);
			},

			set open($$value) {
				$.set(isOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				{
					let $0 = $.derived(() => buttonVariants({
						variant: "ghost",
						size: "sm",
						class: "rounded-btn bg-secondary w-full   text-xs"
					}));

					$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
						Drawer_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_2 = $.first_child(fragment_1);

								$.snippet(node_2, () => $$props.children);
								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Drawer.Content, ($$anchor, Drawer_Content) => {
					Drawer_Content($$anchor, {
						class: 'max-h-[80vh]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Drawer.Header, ($$anchor, Drawer_Header) => {
								Drawer_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Drawer.Title, ($$anchor, Drawer_Title) => {
											Drawer_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(($0) => $.set_text(text, $0), [
														() => $t()("Included Monitors (%count)", { count: String($$props.tags.length) })
													]);

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var div_1 = $.sibling(node_4, 2);
							var node_6 = $.child(div_1);

							{
								var consequent = ($$anchor) => {
									var div_2 = root();
									var text_1 = $.only_child(div_2, true);

									$.template_effect(($0) => $.set_text(text_1, $0), [() => $t()("No monitors available.")]);
									$.append($$anchor, div_2);
								};

								var alternate_1 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_7 = $.first_child(fragment_5);

									$.each(node_7, 18, () => $$props.tags, (tag) => tag, ($$anchor, tag, i) => {
										var div_3 = root_1();
										var node_8 = $.child(div_3);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_6 = $.comment();
												var node_9 = $.first_child(fragment_6);

												$.await(
													node_9,
													() => $.get(monitorBarPromiseByTag)[tag],
													($$anchor) => {
														MonitorBar($$anchor, {
															get tag() {
																return tag;
															}
														});
													},
													($$anchor, monitorBarData) => {
														MonitorBar($$anchor, {
															get tag() {
																return tag;
															},

															get prefetchedData() {
																return $.get(monitorBarData);
															}
														});
													},
													($$anchor, err) => {
														{
															let $0 = $.derived(() => $.get(err) instanceof Error ? $.get(err).message : "Unknown error");

															MonitorBar($$anchor, {
																get tag() {
																	return tag;
																},

																get prefetchedError() {
																	return $.get($0);
																}
															});
														}
													}
												);

												$.append($$anchor, fragment_6);
											};

											var alternate = ($$anchor) => {
												MonitorBar($$anchor, {
													get tag() {
														return tag;
													}
												});
											};

											$.if(node_8, ($$render) => {
												if ($.get(monitorBarPromiseByTag)[tag]) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										$.reset(div_3);
										$.template_effect(() => $.set_class(div_3, 1, `${$.get(i) < $$props.tags.length - 1 ? 'border-b' : ''} py-2 pb-4`));
										$.append($$anchor, div_3);
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_6, ($$render) => {
									if ($$props.tags.length === 0) $$render(consequent); else $$render(alternate_1, -1);
								});
							}

							$.reset(div_1);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}