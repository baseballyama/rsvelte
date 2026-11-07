import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import TrashIcon from "@lucide/svelte/icons/trash";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import * as Select from "$lib/components/ui/select/index.js";

var root = $.from_html(`<!> Danger Zone`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> Updating...`, 1);
var root_3 = $.from_html(`Start Date & Time <span class="text-destructive">*</span>`, 1);
var root_4 = $.from_html(`End Date & Time <span class="text-destructive">*</span>`, 1);
var root_5 = $.from_html(`Type <span class="text-destructive font-mono"> </span> to confirm`, 1);
var root_6 = $.from_html(`<!> Deleting...`, 1);
var root_7 = $.from_html(`<!> Delete Data`, 1);
var root_8 = $.from_html(`<!> Delete Monitor`, 1);
var root_9 = $.from_html(`<h2 class="text-lg font-semibold">Update Status</h2> <div class="mb-5 flex items-center justify-between border-b pb-5"><div>Set Status of the monitor</div> <div class="flex gap-2"><!> <!></div></div> <div class="mb-5 space-y-4 border-b pb-5"><h2 class="text-lg font-semibold">Delete Monitoring Data</h2> <div class="grid grid-cols-2 gap-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="flex items-end gap-4"><div class="flex-1 space-y-2"><!> <p class="text-muted-foreground">This will delete monitoring data for the selected time range. The monitor itself will not be deleted.</p> <!></div> <!></div></div> <div><h2 class="text-lg font-semibold">Delete Monitor</h2> <div class="flex items-end gap-4"><div class="flex-1 space-y-2"><!> <p class="text-muted-foreground">Deleting monitor is irreversible. Please be sure before deleting.</p> <!></div> <!></div></div>`, 1);

export default function DangerZoneCard($$anchor, $$props) {
	$.push($$props, true);

	let monitor = $.prop($$props, 'monitor', 7),
		status = $.prop($$props, 'status', 7);

	const monitorTag = $.derived(() => monitor().tag);
	let deleting = $.state(false);
	let deletingData = $.state(false);
	let updatingStatus = $.state(false);
	let deleteConfirmText = $.state("");
	let deleteDataConfirmText = $.state("");
	let deleteDataStart = $.state("");
	let deleteDataEnd = $.state("");

	async function updateStatus() {
		if (!monitor().id || !monitor().tag) return;

		$.set(updatingStatus, true);

		try {
			const normalizedStatus = status() || "INACTIVE";
			const payload = { ...monitor(), status: normalizedStatus };

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "storeMonitorData", data: payload })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				monitor().status = normalizedStatus;
				status(normalizedStatus);
				toast.success("Monitor status updated successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to update monitor status";

			toast.error(message);
		} finally {
			$.set(updatingStatus, false);
		}
	}

	async function deleteMonitorData() {
		if (!$.get(monitorTag)) return;

		if ($.get(deleteDataConfirmText) !== `delete ${$.get(monitorTag)} data`) {
			toast.error("Please type the correct confirmation text");

			return;
		}

		if (!$.get(deleteDataStart) || !$.get(deleteDataEnd)) {
			toast.error("Start and end dates are required");

			return;
		}

		const startTimestamp = Math.floor(new Date($.get(deleteDataStart)).getTime() / 1000);
		const endTimestamp = Math.floor(new Date($.get(deleteDataEnd)).getTime() / 1000);

		if (startTimestamp >= endTimestamp) {
			toast.error("Start date must be before end date");

			return;
		}

		$.set(deletingData, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteMonitorData",
					data: {
						tag: $.get(monitorTag),
						start: startTimestamp,
						end: endTimestamp
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitoring data deleted successfully");
				$.set(deleteDataConfirmText, "");
				$.set(deleteDataStart, "");
				$.set(deleteDataEnd, "");
			}
		} catch(e) {
			toast.error("Failed to delete monitoring data");
		} finally {
			$.set(deletingData, false);
		}
	}

	async function deleteMonitor() {
		if (!$.get(monitorTag)) return;

		if ($.get(deleteConfirmText) !== `delete ${$.get(monitorTag)}`) {
			toast.error("Please type the correct confirmation text");

			return;
		}

		$.set(deleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "deleteMonitor", data: { tag: $.get(monitorTag) } })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitor deleted successfully");
				goto(clientResolver(resolve, "/manage/app/monitors"));
			}
		} catch(e) {
			toast.error("Failed to delete monitor");
		} finally {
			$.set(deleting, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'border-destructive',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-destructive flex items-center gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										TrashIcon(node_3, { class: 'size-5' });
										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: '',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_9();
							var div = $.sibling($.first_child(fragment_4), 2);
							var div_1 = $.sibling($.child(div), 2);
							var node_5 = $.child(div_1);

							$.component(node_5, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return status();
									},

									onValueChange: (v) => {
										if (v) {
											status(v);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												class: 'w-[180px]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, status()));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															value: 'ACTIVE',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('ACTIVE');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															value: 'INACTIVE',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('INACTIVE');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => $.get(updatingStatus) || status() === (monitor().status || "INACTIVE"));

								Button(node_10, {
									onclick: updateStatus,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_11 = $.first_child(fragment_8);

										{
											var consequent = ($$anchor) => {
												var fragment_9 = root_2();
												var node_12 = $.first_child(fragment_9);

												Loader(node_12, { class: 'size-4 animate-spin' });
												$.next();
												$.append($$anchor, fragment_9);
											};

											var alternate = ($$anchor) => {
												var text_3 = $.text('Update Status');

												$.append($$anchor, text_3);
											};

											$.if(node_11, ($$render) => {
												if ($.get(updatingStatus)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_1);
							$.reset(div);

							var div_2 = $.sibling(div, 2);
							var div_3 = $.sibling($.child(div_2), 2);
							var div_4 = $.child(div_3);
							var node_13 = $.child(div_4);

							Label(node_13, {
								for: 'deleteDataStart',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_10 = root_3();

									$.next();
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							Input(node_14, {
								id: 'deleteDataStart',
								type: 'datetime-local',
								get value() {
									return $.get(deleteDataStart);
								},

								set value($$value) {
									$.set(deleteDataStart, $$value, true);
								}
							});

							$.reset(div_4);

							var div_5 = $.sibling(div_4, 2);
							var node_15 = $.child(div_5);

							Label(node_15, {
								for: 'deleteDataEnd',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_11 = root_4();

									$.next();
									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							Input(node_16, {
								id: 'deleteDataEnd',
								type: 'datetime-local',
								get min() {
									return $.get(deleteDataStart);
								},

								get value() {
									return $.get(deleteDataEnd);
								},

								set value($$value) {
									$.set(deleteDataEnd, $$value, true);
								}
							});

							$.reset(div_5);
							$.reset(div_3);

							var div_6 = $.sibling(div_3, 2);
							var div_7 = $.child(div_6);
							var node_17 = $.child(div_7);

							Label(node_17, {
								for: 'deleteDataConfirm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_12 = root_5();
									var span = $.sibling($.first_child(fragment_12));
									var text_4 = $.only_child(span);

									$.next();
									$.template_effect(() => $.set_text(text_4, `delete ${$.get(monitorTag) ?? ''} data`));
									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 4);

							Input(node_18, {
								id: 'deleteDataConfirm',
								get placeholder() {
									return `delete ${$.get(monitorTag) ?? ''} data`;
								},

								get value() {
									return $.get(deleteDataConfirmText);
								},

								set value($$value) {
									$.set(deleteDataConfirmText, $$value, true);
								}
							});

							$.reset(div_7);

							var node_19 = $.sibling(div_7, 2);

							{
								let $0 = $.derived(() => $.get(deletingData) || $.get(deleteDataConfirmText) !== `delete ${$.get(monitorTag)} data`);

								Button(node_19, {
									variant: 'destructive',
									onclick: deleteMonitorData,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_13 = $.comment();
										var node_20 = $.first_child(fragment_13);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_14 = root_6();
												var node_21 = $.first_child(fragment_14);

												Loader(node_21, { class: 'size-4 animate-spin' });
												$.next();
												$.append($$anchor, fragment_14);
											};

											var alternate_1 = ($$anchor) => {
												var fragment_15 = root_7();
												var node_22 = $.first_child(fragment_15);

												TrashIcon(node_22, { class: 'size-4' });
												$.next();
												$.append($$anchor, fragment_15);
											};

											$.if(node_20, ($$render) => {
												if ($.get(deletingData)) $$render(consequent_1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_6);
							$.reset(div_2);

							var div_8 = $.sibling(div_2, 2);
							var div_9 = $.sibling($.child(div_8), 2);
							var div_10 = $.child(div_9);
							var node_23 = $.child(div_10);

							Label(node_23, {
								for: 'deleteConfirm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_16 = root_5();
									var span_1 = $.sibling($.first_child(fragment_16));
									var text_5 = $.only_child(span_1);

									$.next();
									$.template_effect(() => $.set_text(text_5, `delete ${$.get(monitorTag) ?? ''}`));
									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 4);

							Input(node_24, {
								id: 'deleteConfirm',
								get placeholder() {
									return `delete ${$.get(monitorTag) ?? ''}`;
								},

								get value() {
									return $.get(deleteConfirmText);
								},

								set value($$value) {
									$.set(deleteConfirmText, $$value, true);
								}
							});

							$.reset(div_10);

							var node_25 = $.sibling(div_10, 2);

							{
								let $0 = $.derived(() => $.get(deleting) || $.get(deleteConfirmText) !== `delete ${$.get(monitorTag)}`);

								Button(node_25, {
									variant: 'destructive',
									onclick: deleteMonitor,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_17 = $.comment();
										var node_26 = $.first_child(fragment_17);

										{
											var consequent_2 = ($$anchor) => {
												var fragment_18 = root_6();
												var node_27 = $.first_child(fragment_18);

												Loader(node_27, { class: 'size-4 animate-spin' });
												$.next();
												$.append($$anchor, fragment_18);
											};

											var alternate_2 = ($$anchor) => {
												var fragment_19 = root_8();
												var node_28 = $.first_child(fragment_19);

												TrashIcon(node_28, { class: 'size-4' });
												$.next();
												$.append($$anchor, fragment_19);
											};

											$.if(node_26, ($$render) => {
												if ($.get(deleting)) $$render(consequent_2); else $$render(alternate_2, -1);
											});
										}

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_9);
							$.reset(div_8);
							$.append($$anchor, fragment_4);
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