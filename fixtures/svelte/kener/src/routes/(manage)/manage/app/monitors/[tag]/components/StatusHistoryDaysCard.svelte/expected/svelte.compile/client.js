import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-4"><div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Number of days shown on desktop screens</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Number of days shown on mobile screens</p></div></div> <p class="text-muted-foreground text-xs"> </p>`, 1);
var root_2 = $.from_html(`<!> Save Status History Settings`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function StatusHistoryDaysCard($$anchor, $$props) {
	$.push($$props, true);

	let monitor = $.prop($$props, 'monitor', 15),
		statusHistoryDays = $.prop($$props, 'statusHistoryDays', 15);

	let saving = $.state(false);
	const isDesktopValid = $.derived(() => Number.isInteger(statusHistoryDays().desktop) && statusHistoryDays().desktop >= GC.STATUS_HISTORY_DAYS_MIN && statusHistoryDays().desktop <= GC.STATUS_HISTORY_DAYS_MAX);
	const isMobileValid = $.derived(() => Number.isInteger(statusHistoryDays().mobile) && statusHistoryDays().mobile >= GC.STATUS_HISTORY_DAYS_MIN && statusHistoryDays().mobile <= GC.STATUS_HISTORY_DAYS_MAX);
	const isValid = $.derived(() => $.get(isDesktopValid) && $.get(isMobileValid));

	async function save() {
		if (!$.get(isValid)) {
			toast.error(`Days must be a whole number between ${GC.STATUS_HISTORY_DAYS_MIN} and ${GC.STATUS_HISTORY_DAYS_MAX}`);

			return;
		}

		$.set(saving, true);

		try {
			// Merge with existing monitor_settings_json to avoid overwriting other settings
			let existingSettings = {};

			if (monitor().monitor_settings_json) {
				try {
					existingSettings = JSON.parse(monitor().monitor_settings_json);
				} catch {
					existingSettings = {};
				}
			}

			const mergedSettings = {
				...existingSettings,
				monitor_status_history_days: {
					desktop: statusHistoryDays().desktop,
					mobile: statusHistoryDays().mobile
				}
			};

			const payload = {
				...monitor(),
				type_data: JSON.stringify($$props.typeData),
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
				monitor(monitor().monitor_settings_json = JSON.stringify(mergedSettings), true);

				toast.success("Status history settings saved successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to save status history settings";

			toast.error(message);
		} finally {
			$.set(saving, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Status History Days');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Configure how many days of status history to display by default when this monitor loads on a status page');

										$.append($$anchor, text_1);
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
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								for: 'monitor-history-desktop',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Desktop (days)');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => $.get(isDesktopValid) ? "" : "border-destructive");

								Input(node_6, {
									id: 'monitor-history-desktop',
									type: 'number',
									step: '1',
									get min() {
										return GC.STATUS_HISTORY_DAYS_MIN;
									},

									get max() {
										return GC.STATUS_HISTORY_DAYS_MAX;
									},

									get class() {
										return $.get($0);
									},

									get value() {
										return statusHistoryDays().desktop;
									},

									set value($$value) {
										statusHistoryDays(statusHistoryDays().desktop = $$value, true);
									}
								});
							}

							$.next(2);
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_7 = $.child(div_2);

							Label(node_7, {
								for: 'monitor-history-mobile',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Mobile (days)');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							{
								let $0 = $.derived(() => $.get(isMobileValid) ? "" : "border-destructive");

								Input(node_8, {
									id: 'monitor-history-mobile',
									type: 'number',
									step: '1',
									get min() {
										return GC.STATUS_HISTORY_DAYS_MIN;
									},

									get max() {
										return GC.STATUS_HISTORY_DAYS_MAX;
									},

									get class() {
										return $.get($0);
									},

									get value() {
										return statusHistoryDays().mobile;
									},

									set value($$value) {
										statusHistoryDays(statusHistoryDays().mobile = $$value, true);
									}
								});
							}

							$.next(2);
							$.reset(div_2);
							$.reset(div);

							var p = $.sibling(div, 2);
							var text_4 = $.only_child(p);

							$.template_effect(() => $.set_text(text_4, `This overrides the page-level default for this monitor. Values must be whole numbers between ${GC.STATUS_HISTORY_DAYS_MIN ?? ''}
      and ${GC.STATUS_HISTORY_DAYS_MAX ?? ''}.`));

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_4, 2);

				$.component(node_9, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex justify-end',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => $.get(saving) || !$.get(isValid));

								Button($$anchor, {
									onclick: save,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_10 = $.first_child(fragment_5);

										{
											var consequent = ($$anchor) => {
												Loader($$anchor, { class: 'size-4 animate-spin' });
											};

											var alternate = ($$anchor) => {
												SaveIcon($$anchor, { class: 'size-4' });
											};

											$.if(node_10, ($$render) => {
												if ($.get(saving)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.next();
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							}
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