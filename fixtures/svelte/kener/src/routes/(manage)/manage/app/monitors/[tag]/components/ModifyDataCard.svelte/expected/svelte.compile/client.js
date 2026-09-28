import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import DatabaseIcon from "@lucide/svelte/icons/database";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> Modify Monitoring Data`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Start Date & Time <span class="text-destructive">*</span>`, 1);
var root_3 = $.from_html(`End Date & Time <span class="text-destructive">*</span>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<p class="text-destructive text-sm"> </p>`);

var root_6 = $.from_html(`<div class="grid gap-4"><div class="grid grid-cols-2 gap-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="grid grid-cols-3 gap-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <p class="text-muted-foreground text-xs">Latency will be randomly generated as latency ± deviation for each data point. Set deviation to 0 for a fixed
        latency value.</p> <!></div>`);

var root_7 = $.from_html(`<!> Saving...`, 1);
var root_8 = $.from_html(`<!> Save Changes`, 1);

export default function ModifyDataCard($$anchor, $$props) {
	$.push($$props, true);

	let modifyingData = $.state(false);
	let modifyDataError = $.state(null);

	let modifyDataForm = $.state($.proxy({
		start: "",
		end: "",
		newStatus: "UP",
		latency: 0,
		deviation: 0
	}));

	async function modifyMonitoringData() {
		$.set(modifyDataError, null);

		if (!$.get(modifyDataForm).start) {
			$.set(modifyDataError, "Start date is required");

			return;
		}

		if (!$.get(modifyDataForm).end) {
			$.set(modifyDataError, "End date is required");

			return;
		}

		const startTimestamp = Math.floor(new Date($.get(modifyDataForm).start).getTime() / 1000);
		const endTimestamp = Math.floor(new Date($.get(modifyDataForm).end).getTime() / 1000);

		if (startTimestamp >= endTimestamp) {
			$.set(modifyDataError, "Start date must be before end date");

			return;
		}

		if ($.get(modifyDataForm).latency < 0) {
			$.set(modifyDataError, "Latency must be non-negative");

			return;
		}

		if ($.get(modifyDataForm).deviation < 0) {
			$.set(modifyDataError, "Deviation must be non-negative");

			return;
		}

		$.set(modifyingData, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updateMonitoringData",
					data: {
						monitor_tag: $$props.monitorTag,
						start: startTimestamp,
						end: endTimestamp,
						newStatus: $.get(modifyDataForm).newStatus,
						latency: $.get(modifyDataForm).latency,
						deviation: $.get(modifyDataForm).deviation
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				$.set(modifyDataError, result.error, true);
			} else {
				toast.success("Monitoring data updated successfully");

				$.set(
					modifyDataForm,
					{
						start: "",
						end: "",
						newStatus: "UP",
						latency: 0,
						deviation: 0
					},
					true
				);
			}
		} catch(e) {
			$.set(modifyDataError, "Failed to update monitoring data");
		} finally {
			$.set(modifyingData, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'flex items-center gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										DatabaseIcon(node_3, { class: 'size-5' });
										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Change the status of monitoring data for a given time range');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_6();
							var div_1 = $.child(div);
							var div_2 = $.child(div_1);
							var node_6 = $.child(div_2);

							Label(node_6, {
								for: 'start_date',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_2();

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Input(node_7, {
								id: 'start_date',
								type: 'datetime-local',
								get value() {
									return $.get(modifyDataForm).start;
								},

								set value($$value) {
									$.get(modifyDataForm).start = $$value;
								}
							});

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_8 = $.child(div_3);

							Label(node_8, {
								for: 'end_date',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_5 = root_3();

									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Input(node_9, {
								id: 'end_date',
								type: 'datetime-local',
								get min() {
									return $.get(modifyDataForm).start;
								},

								get value() {
									return $.get(modifyDataForm).end;
								},

								set value($$value) {
									$.get(modifyDataForm).end = $$value;
								}
							});

							$.reset(div_3);
							$.reset(div_1);

							var div_4 = $.sibling(div_1, 2);
							var div_5 = $.child(div_4);
							var node_10 = $.child(div_5);

							Label(node_10, {
								for: 'new_status',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('New Status');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(modifyDataForm).newStatus;
									},

									onValueChange: (value) => {
										if (value) $.get(modifyDataForm).newStatus = value;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_12 = $.first_child(fragment_6);

										$.component(node_12, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												id: 'new_status',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $.get(modifyDataForm).newStatus));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_4();
													var node_14 = $.first_child(fragment_8);

													$.component(node_14, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															value: 'UP',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('UP');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															value: 'DEGRADED',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('DEGRADED');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Select.Item, ($$anchor, Select_Item_2) => {
														Select_Item_2($$anchor, {
															value: 'DOWN',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('DOWN');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_5);

							var div_6 = $.sibling(div_5, 2);
							var node_17 = $.child(div_6);

							Label(node_17, {
								for: 'latency',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Latency (ms)');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							Input(node_18, {
								id: 'latency',
								type: 'number',
								min: '0',
								placeholder: '100',
								get value() {
									return $.get(modifyDataForm).latency;
								},

								set value($$value) {
									$.get(modifyDataForm).latency = $$value;
								}
							});

							$.reset(div_6);

							var div_7 = $.sibling(div_6, 2);
							var node_19 = $.child(div_7);

							Label(node_19, {
								for: 'deviation',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Deviation (ms)');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							Input(node_20, {
								id: 'deviation',
								type: 'number',
								min: '0',
								placeholder: '0',
								get value() {
									return $.get(modifyDataForm).deviation;
								},

								set value($$value) {
									$.get(modifyDataForm).deviation = $$value;
								}
							});

							$.reset(div_7);
							$.reset(div_4);

							var node_21 = $.sibling(div_4, 4);

							{
								var consequent = ($$anchor) => {
									var p = root_5();
									var text_8 = $.only_child(p, true);

									$.template_effect(() => $.set_text(text_8, $.get(modifyDataError)));
									$.append($$anchor, p);
								};

								$.if(node_21, ($$render) => {
									if ($.get(modifyDataError)) $$render(consequent);
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_22 = $.sibling(node_5, 2);

				$.component(node_22, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex justify-end',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								onclick: modifyMonitoringData,
								get disabled() {
									return $.get(modifyingData);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_10 = $.comment();
									var node_23 = $.first_child(fragment_10);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_11 = root_7();
											var node_24 = $.first_child(fragment_11);

											Loader(node_24, { class: 'size-4 animate-spin' });
											$.next();
											$.append($$anchor, fragment_11);
										};

										var alternate = ($$anchor) => {
											var fragment_12 = root_8();
											var node_25 = $.first_child(fragment_12);

											SaveIcon(node_25, { class: 'size-4' });
											$.next();
											$.append($$anchor, fragment_12);
										};

										$.if(node_23, ($$render) => {
											if ($.get(modifyingData)) $$render(consequent_1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
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
}