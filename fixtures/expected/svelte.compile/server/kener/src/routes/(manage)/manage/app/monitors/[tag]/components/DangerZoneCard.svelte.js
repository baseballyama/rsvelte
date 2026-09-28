import * as $ from 'svelte/internal/server';
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

export default function DangerZoneCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor, status } = $$props;
		const monitorTag = $.derived(() => monitor.tag);
		let deleting = false;
		let deletingData = false;
		let updatingStatus = false;
		let deleteConfirmText = "";
		let deleteDataConfirmText = "";
		let deleteDataStart = "";
		let deleteDataEnd = "";

		async function updateStatus() {
			if (!monitor.id || !monitor.tag) return;

			updatingStatus = true;

			try {
				const normalizedStatus = status || "INACTIVE";
				const payload = { ...monitor, status: normalizedStatus };

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeMonitorData", data: payload })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					monitor.status = normalizedStatus;
					status = normalizedStatus;
					toast.success("Monitor status updated successfully");
				}
			} catch(e) {
				const message = e instanceof Error ? e.message : "Failed to update monitor status";

				toast.error(message);
			} finally {
				updatingStatus = false;
			}
		}

		async function deleteMonitorData() {
			if (!monitorTag()) return;

			if (deleteDataConfirmText !== `delete ${monitorTag()} data`) {
				toast.error("Please type the correct confirmation text");

				return;
			}

			if (!deleteDataStart || !deleteDataEnd) {
				toast.error("Start and end dates are required");

				return;
			}

			const startTimestamp = Math.floor(new Date(deleteDataStart).getTime() / 1000);
			const endTimestamp = Math.floor(new Date(deleteDataEnd).getTime() / 1000);

			if (startTimestamp >= endTimestamp) {
				toast.error("Start date must be before end date");

				return;
			}

			deletingData = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteMonitorData",
						data: { tag: monitorTag(), start: startTimestamp, end: endTimestamp }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitoring data deleted successfully");
					deleteDataConfirmText = "";
					deleteDataStart = "";
					deleteDataEnd = "";
				}
			} catch(e) {
				toast.error("Failed to delete monitoring data");
			} finally {
				deletingData = false;
			}
		}

		async function deleteMonitor() {
			if (!monitorTag()) return;

			if (deleteConfirmText !== `delete ${monitorTag()}`) {
				toast.error("Please type the correct confirmation text");

				return;
			}

			deleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "deleteMonitor", data: { tag: monitorTag() } })
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
				deleting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'border-destructive',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											class: 'text-destructive flex items-center gap-2',
											children: ($$renderer) => {
												TrashIcon($$renderer, { class: 'size-5' });
												$$renderer.push(`<!----> Danger Zone`);
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

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: '',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold">Update Status</h2> <div class="mb-5 flex items-center justify-between border-b pb-5"><div>Set Status of the monitor</div> <div class="flex gap-2">`);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: status,
											onValueChange: (v) => {
												if (v) {
													status = v;
												}
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														class: 'w-[180px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(status)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Select.Content) {
													$$renderer.push('<!--[-->');

													Select.Content($$renderer, {
														children: ($$renderer) => {
															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'ACTIVE',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->ACTIVE`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'INACTIVE',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->INACTIVE`);
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

									$$renderer.push(` `);

									Button($$renderer, {
										onclick: updateStatus,
										disabled: updatingStatus || status === (monitor.status || "INACTIVE"),
										children: ($$renderer) => {
											if (updatingStatus) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
												$$renderer.push(`<!----> Updating...`);
											} else {
												$$renderer.push(`<!--[-1-->Update Status`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div> <div class="mb-5 space-y-4 border-b pb-5"><h2 class="text-lg font-semibold">Delete Monitoring Data</h2> <div class="grid grid-cols-2 gap-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'deleteDataStart',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Start Date &amp; Time <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'deleteDataStart',
										type: 'datetime-local',
										get value() {
											return deleteDataStart;
										},

										set value($$value) {
											deleteDataStart = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'deleteDataEnd',
										children: ($$renderer) => {
											$$renderer.push(`<!---->End Date &amp; Time <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'deleteDataEnd',
										type: 'datetime-local',
										min: deleteDataStart,
										get value() {
											return deleteDataEnd;
										},

										set value($$value) {
											deleteDataEnd = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> <div class="flex items-end gap-4"><div class="flex-1 space-y-2">`);

									Label($$renderer, {
										for: 'deleteDataConfirm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Type <span class="text-destructive font-mono">delete ${$.escape(monitorTag())} data</span> to confirm`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground">This will delete monitoring data for the selected time range. The monitor itself will not be deleted.</p> `);

									Input($$renderer, {
										id: 'deleteDataConfirm',
										placeholder: `delete ${$.stringify(monitorTag())} data`,
										get value() {
											return deleteDataConfirmText;
										},

										set value($$value) {
											deleteDataConfirmText = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> `);

									Button($$renderer, {
										variant: 'destructive',
										onclick: deleteMonitorData,
										disabled: deletingData || deleteDataConfirmText !== `delete ${monitorTag()} data`,
										children: ($$renderer) => {
											if (deletingData) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
												$$renderer.push(`<!----> Deleting...`);
											} else {
												$$renderer.push('<!--[-1-->');
												TrashIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----> Delete Data`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div> <div><h2 class="text-lg font-semibold">Delete Monitor</h2> <div class="flex items-end gap-4"><div class="flex-1 space-y-2">`);

									Label($$renderer, {
										for: 'deleteConfirm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Type <span class="text-destructive font-mono">delete ${$.escape(monitorTag())}</span> to confirm`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground">Deleting monitor is irreversible. Please be sure before deleting.</p> `);

									Input($$renderer, {
										id: 'deleteConfirm',
										placeholder: `delete ${$.stringify(monitorTag())}`,
										get value() {
											return deleteConfirmText;
										},

										set value($$value) {
											deleteConfirmText = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> `);

									Button($$renderer, {
										variant: 'destructive',
										onclick: deleteMonitor,
										disabled: deleting || deleteConfirmText !== `delete ${monitorTag()}`,
										children: ($$renderer) => {
											if (deleting) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
												$$renderer.push(`<!----> Deleting...`);
											} else {
												$$renderer.push('<!--[-1-->');
												TrashIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----> Delete Monitor`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
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
	});
}