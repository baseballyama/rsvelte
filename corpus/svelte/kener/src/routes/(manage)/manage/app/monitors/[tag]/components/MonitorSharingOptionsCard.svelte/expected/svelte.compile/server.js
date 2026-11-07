import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function MonitorSharingOptionsCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor = void 0, typeData, subMenuOptions } = $$props;
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

		let sharingOptions = parseSharingOptions(monitor.monitor_settings_json);
		let saving = false;

		async function save() {
			saving = true;

			try {
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
					sharing_options: {
						showShareBadgeMonitor: sharingOptions.showShareBadgeMonitor,
						showShareEmbedMonitor: sharingOptions.showShareEmbedMonitor
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
					monitor.monitor_settings_json = JSON.stringify(mergedSettings);
					toast.success("Sharing options saved successfully");
				}
			} catch(e) {
				const message = e instanceof Error ? e.message : "Failed to save sharing options";

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
												$$renderer.push(`<!---->Sharing Options`);
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
												$$renderer.push(`<!---->Control which sharing actions are available for this monitor`);
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
								class: 'space-y-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center justify-between"><div class="space-y-0.5">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Share Badge`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Show option to get embeddable status and uptime badges <span${$.attr_class('text-red-500', void 0, { 'hidden': subMenuOptions?.showShareBadgeMonitor })}>Disabled by site settings</span></p></div> `);

									Switch($$renderer, {
										disabled: !subMenuOptions?.showShareBadgeMonitor,
										get checked() {
											return sharingOptions.showShareBadgeMonitor;
										},

										set checked($$value) {
											sharingOptions.showShareBadgeMonitor = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Share Embed`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Show option to get iframe or script embed code for this monitor <span${$.attr_class('text-red-500', void 0, { 'hidden': subMenuOptions?.showShareEmbedMonitor })}>Disabled by site settings</span></p></div> `);

									Switch($$renderer, {
										disabled: !subMenuOptions?.showShareEmbedMonitor,
										get checked() {
											return sharingOptions.showShareEmbedMonitor;
										},

										set checked($$value) {
											sharingOptions.showShareEmbedMonitor = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div>`);
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
										disabled: saving,
										children: ($$renderer) => {
											if (saving) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
											}

											$$renderer.push(`<!--]--> Save Sharing Options`);
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
		$.bind_props($$props, { monitor });
	});
}