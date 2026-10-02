import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import GC from "$lib/global-constants.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function StatusHistoryDaysCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor = void 0, typeData, statusHistoryDays = void 0 } = $$props;
		let saving = false;
		const isDesktopValid = $.derived(() => Number.isInteger(statusHistoryDays.desktop) && statusHistoryDays.desktop >= GC.STATUS_HISTORY_DAYS_MIN && statusHistoryDays.desktop <= GC.STATUS_HISTORY_DAYS_MAX);
		const isMobileValid = $.derived(() => Number.isInteger(statusHistoryDays.mobile) && statusHistoryDays.mobile >= GC.STATUS_HISTORY_DAYS_MIN && statusHistoryDays.mobile <= GC.STATUS_HISTORY_DAYS_MAX);
		const isValid = $.derived(() => isDesktopValid() && isMobileValid());

		async function save() {
			if (!isValid()) {
				toast.error(`Days must be a whole number between ${GC.STATUS_HISTORY_DAYS_MIN} and ${GC.STATUS_HISTORY_DAYS_MAX}`);

				return;
			}

			saving = true;

			try {
				// Merge with existing monitor_settings_json to avoid overwriting other settings
				let existingSettings = {};

				if (monitor.monitor_settings_json) {
					try {
						existingSettings = JSON.parse(monitor.monitor_settings_json);
					} catch {
						existingSettings = {};
					}
				}

				const mergedSettings = {
					...existingSettings,
					monitor_status_history_days: {
						desktop: statusHistoryDays.desktop,
						mobile: statusHistoryDays.mobile
					}
				};

				const payload = {
					...monitor,
					type_data: JSON.stringify(typeData),
					monitor_settings_json: JSON.stringify(mergedSettings)
				};

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeMonitorData", data: payload })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					// Update the monitor's settings_json so subsequent saves from other cards stay in sync
					monitor.monitor_settings_json = JSON.stringify(mergedSettings);

					toast.success("Status history settings saved successfully");
				}
			} catch(e) {
				const message = e instanceof Error ? e.message : "Failed to save status history settings";

				toast.error(message);
			} finally {
				saving = false;
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
											children: ($$renderer) => {
												$$renderer.push(`<!---->Status History Days`);
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
												$$renderer.push(`<!---->Configure how many days of status history to display by default when this monitor loads on a status page`);
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
								class: 'space-y-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid grid-cols-2 gap-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'monitor-history-desktop',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Desktop (days)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-history-desktop',
										type: 'number',
										step: '1',
										min: GC.STATUS_HISTORY_DAYS_MIN,
										max: GC.STATUS_HISTORY_DAYS_MAX,
										class: isDesktopValid() ? "" : "border-destructive",
										get value() {
											return statusHistoryDays.desktop;
										},

										set value($$value) {
											statusHistoryDays.desktop = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Number of days shown on desktop screens</p></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'monitor-history-mobile',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Mobile (days)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-history-mobile',
										type: 'number',
										step: '1',
										min: GC.STATUS_HISTORY_DAYS_MIN,
										max: GC.STATUS_HISTORY_DAYS_MAX,
										class: isMobileValid() ? "" : "border-destructive",
										get value() {
											return statusHistoryDays.mobile;
										},

										set value($$value) {
											statusHistoryDays.mobile = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Number of days shown on mobile screens</p></div></div> <p class="text-muted-foreground text-xs">This overrides the page-level default for this monitor. Values must be whole numbers between ${$.escape(GC.STATUS_HISTORY_DAYS_MIN)}
      and ${$.escape(GC.STATUS_HISTORY_DAYS_MAX)}.</p>`);
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
										onclick: save,
										disabled: saving || !isValid(),
										children: ($$renderer) => {
											if (saving) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
											}

											$$renderer.push(`<!--]--> Save Status History Settings`);
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
		$.bind_props($$props, { monitor, statusHistoryDays });
	});
}