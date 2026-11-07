import * as $ from 'svelte/internal/server';
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

export default function ModifyDataCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitorTag } = $$props;
		let modifyingData = false;
		let modifyDataError = null;

		let modifyDataForm = {
			start: "",
			end: "",
			newStatus: "UP",
			latency: 0,
			deviation: 0
		};

		async function modifyMonitoringData() {
			modifyDataError = null;

			if (!modifyDataForm.start) {
				modifyDataError = "Start date is required";

				return;
			}

			if (!modifyDataForm.end) {
				modifyDataError = "End date is required";

				return;
			}

			const startTimestamp = Math.floor(new Date(modifyDataForm.start).getTime() / 1000);
			const endTimestamp = Math.floor(new Date(modifyDataForm.end).getTime() / 1000);

			if (startTimestamp >= endTimestamp) {
				modifyDataError = "Start date must be before end date";

				return;
			}

			if (modifyDataForm.latency < 0) {
				modifyDataError = "Latency must be non-negative";

				return;
			}

			if (modifyDataForm.deviation < 0) {
				modifyDataError = "Deviation must be non-negative";

				return;
			}

			modifyingData = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateMonitoringData",
						data: {
							monitor_tag: monitorTag,
							start: startTimestamp,
							end: endTimestamp,
							newStatus: modifyDataForm.newStatus,
							latency: modifyDataForm.latency,
							deviation: modifyDataForm.deviation
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					modifyDataError = result.error;
				} else {
					toast.success("Monitoring data updated successfully");

					modifyDataForm = {
						start: "",
						end: "",
						newStatus: "UP",
						latency: 0,
						deviation: 0
					};
				}
			} catch(e) {
				modifyDataError = "Failed to update monitoring data";
			} finally {
				modifyingData = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											class: 'flex items-center gap-2',
											children: ($$renderer) => {
												DatabaseIcon($$renderer, { class: 'size-5' });
												$$renderer.push(`<!----> Modify Monitoring Data`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Change the status of monitoring data for a given time range`);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid gap-4"><div class="grid grid-cols-2 gap-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'start_date',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Start Date &amp; Time <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'start_date',
										type: 'datetime-local',
										get value() {
											return modifyDataForm.start;
										},

										set value($$value) {
											modifyDataForm.start = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'end_date',
										children: ($$renderer) => {
											$$renderer.push(`<!---->End Date &amp; Time <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'end_date',
										type: 'datetime-local',
										min: modifyDataForm.start,
										get value() {
											return modifyDataForm.end;
										},

										set value($$value) {
											modifyDataForm.end = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> <div class="grid grid-cols-3 gap-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'new_status',
										children: ($$renderer) => {
											$$renderer.push(`<!---->New Status`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: modifyDataForm.newStatus,
											onValueChange: (value) => {
												if (value) modifyDataForm.newStatus = value;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'new_status',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(modifyDataForm.newStatus)}`);
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
																	value: 'UP',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->UP`);
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
																	value: 'DEGRADED',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->DEGRADED`);
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
																	value: 'DOWN',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->DOWN`);
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

									$$renderer.push(`</div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'latency',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Latency (ms)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'latency',
										type: 'number',
										min: '0',
										placeholder: '100',
										get value() {
											return modifyDataForm.latency;
										},

										set value($$value) {
											modifyDataForm.latency = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'deviation',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Deviation (ms)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'deviation',
										type: 'number',
										min: '0',
										placeholder: '0',
										get value() {
											return modifyDataForm.deviation;
										},

										set value($$value) {
											modifyDataForm.deviation = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> <p class="text-muted-foreground text-xs">Latency will be randomly generated as latency ± deviation for each data point. Set deviation to 0 for a fixed
        latency value.</p> `);

									if (modifyDataError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(modifyDataError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'flex justify-end',
								children: ($$renderer) => {
									Button($$renderer, {
										onclick: modifyMonitoringData,
										disabled: modifyingData,
										children: ($$renderer) => {
											if (modifyingData) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
												$$renderer.push(`<!----> Saving...`);
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----> Save Changes`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
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