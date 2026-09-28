import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Show option to get embeddable status and uptime badges <span>Disabled by site settings</span></p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Show option to get iframe or script embed code for this monitor <span>Disabled by site settings</span></p></div> <!></div>`, 1);
var root_2 = $.from_html(`<!> Save Sharing Options`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function MonitorSharingOptionsCard($$anchor, $$props) {
	$.push($$props, true);

	let monitor = $.prop($$props, 'monitor', 15);
	const DEFAULT_SHARING_OPTIONS = { showShareBadgeMonitor: true, showShareEmbedMonitor: true };

	function parseSharingOptions(monitorSettingsJson) {
		if (!monitorSettingsJson) {
			return { ...DEFAULT_SHARING_OPTIONS };
		}

		try {
			const settings = JSON.parse(monitorSettingsJson);
			const parsed = settings.sharing_options ?? {};

			return {
				showShareBadgeMonitor: parsed.showShareBadgeMonitor ?? true,
				showShareEmbedMonitor: parsed.showShareEmbedMonitor ?? true
			};
		} catch {
			return { ...DEFAULT_SHARING_OPTIONS };
		}
	}

	let sharingOptions = $.proxy(parseSharingOptions(monitor().monitor_settings_json));
	let saving = $.state(false);

	async function save() {
		$.set(saving, true);

		try {
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
				sharing_options: {
					showShareBadgeMonitor: sharingOptions.showShareBadgeMonitor,
					showShareEmbedMonitor: sharingOptions.showShareEmbedMonitor
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
				monitor(monitor().monitor_settings_json = JSON.stringify(mergedSettings), true);
				toast.success("Sharing options saved successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to save sharing options";

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

										var text = $.text('Sharing Options');

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

										var text_1 = $.text('Control which sharing actions are available for this monitor');

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
						class: 'space-y-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Share Badge');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var p = $.sibling(node_5, 2);
							var span = $.sibling($.child(p));
							let classes;

							$.reset(p);
							$.reset(div_1);

							var node_6 = $.sibling(div_1, 2);

							{
								let $0 = $.derived(() => !$$props.subMenuOptions?.showShareBadgeMonitor);

								Switch(node_6, {
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return sharingOptions.showShareBadgeMonitor;
									},

									set checked($$value) {
										sharingOptions.showShareBadgeMonitor = $$value;
									}
								});
							}

							$.reset(div);

							var div_2 = $.sibling(div, 2);
							var div_3 = $.child(div_2);
							var node_7 = $.child(div_3);

							Label(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Share Embed');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var p_1 = $.sibling(node_7, 2);
							var span_1 = $.sibling($.child(p_1));
							let classes_1;

							$.reset(p_1);
							$.reset(div_3);

							var node_8 = $.sibling(div_3, 2);

							{
								let $0 = $.derived(() => !$$props.subMenuOptions?.showShareEmbedMonitor);

								Switch(node_8, {
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return sharingOptions.showShareEmbedMonitor;
									},

									set checked($$value) {
										sharingOptions.showShareEmbedMonitor = $$value;
									}
								});
							}

							$.reset(div_2);

							$.template_effect(() => {
								classes = $.set_class(span, 1, 'text-red-500', null, classes, { hidden: $$props.subMenuOptions?.showShareBadgeMonitor });
								classes_1 = $.set_class(span_1, 1, 'text-red-500', null, classes_1, { hidden: $$props.subMenuOptions?.showShareEmbedMonitor });
							});

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
							Button($$anchor, {
								onclick: save,
								get disabled() {
									return $.get(saving);
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