import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
import { setMode, mode } from "mode-watcher";
import { page } from "$app/state";
import { i18n, t } from "$lib/stores/i18n";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import Sun from "@lucide/svelte/icons/sun";
import Moon from "@lucide/svelte/icons/moon";
import Share from "@lucide/svelte/icons/share-2";
import Rss from "@lucide/svelte/icons/rss";
import { format } from "date-fns";
import SubscribeMenu from "$lib/components/SubscribeMenu.svelte";
import CopyButton from "$lib/components/CopyButton.svelte";
import BadgesMenu from "$lib/components/BadgesMenu.svelte";
import EmbedMenu from "$lib/components/EmbedMenu.svelte";
import { onMount } from "svelte";
import LanguageSelector from "./LanguageSelector.svelte";
import TimezoneSelector from "./TimezoneSelector.svelte";
import trackEvent from "$lib/beacon";
import SiteBanner from "./SiteBanner.svelte";
import NotificationsPopover from "./NotificationsPopover.svelte";
import PageSelector from "./PageSelector.svelte";

export default function ThemePlus($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			monitor_tags = [],
			embedMonitorTag = "",
			hideNotificationsPopover = false
		} = $$props;

		let protocol = "";
		let domain = "";
		let shareLink = "";
		const eventsPath = $.derived(() => `/events/${format(new Date(), "MMMM-yyyy")}`);
		const showNotificationsPopover = $.derived(() => !hideNotificationsPopover);

		const rssHref = $.derived(() => {
			const params = page.params;

			if (params.monitor_tag) return clientResolver(resolve, `/monitors/${params.monitor_tag}/rss.xml`);
			if (params.page_path) return clientResolver(resolve, `/${params.page_path}/rss.xml`);

			return clientResolver(resolve, "/rss.xml");
		});

		const loginDetails = $.derived(() => {
			if (!page.data?.loggedInUser) return null;

			if (page.route.id === "/(kener)/monitors/[monitor_tag]") {
				return {
					label: $.store_get($$store_subs ??= {}, '$t', t)("Edit Monitor"),
					url: clientResolver(resolve, "/manage/app/monitors/" + page.params.monitor_tag)
				};
			} else if (page.route.id === "/(kener)/incidents/[incident_id]") {
				return {
					label: $.store_get($$store_subs ??= {}, '$t', t)("Update Incident"),
					url: clientResolver(resolve, "/manage/app/incidents/" + page.params.incident_id)
				};
			} else if (page.route.id === "/(kener)/maintenances/[maintenance_id]") {
				return {
					label: $.store_get($$store_subs ??= {}, '$t', t)("Update Maintenance"),
					url: clientResolver(resolve, "/manage/app/maintenances/" + page.data.maintenance.id)
				};
			} else {
				return {
					label: $.store_get($$store_subs ??= {}, '$t', t)("Manage Site"),
					url: clientResolver(resolve, "/manage/app/site-configurations")
				};
			}
		});

		function toggleMode() {
			if (mode.current === "light") {
				setMode("dark");
			} else {
				setMode("light");
			}

			trackEvent("theme_toggled", { mode: mode.current });
		}

		onMount(() => {
			protocol = window.location.protocol;
			domain = window.location.host;
			shareLink = window.location.href;
		});

		$$renderer.push(`<div class="theme-plus-bar scrollbar-hidden sticky top-18 z-20 flex w-full items-center gap-2 rounded py-2">`);

		if (!!!page.data.globalPageVisibilitySettings.forceExclusivity && page.data.globalPageVisibilitySettings.showSwitcher) {
			$$renderer.push('<!--[0-->');
			PageSelector($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="ml-auto flex shrink-0 items-center gap-2">`);

		if (page.data.isSubsEnabled && page.data.canSendEmail) {
			$$renderer.push('<!--[0-->');

			if (ButtonGroup.Root) {
				$$renderer.push('<!--[-->');

				ButtonGroup.Root($$renderer, {
					class: 'hidden shrink-0 sm:flex',
					children: ($$renderer) => {
						SubscribeMenu($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (page.data.isSubsEnabled && page.data.canSendEmail) {
			$$renderer.push('<!--[0-->');

			if (ButtonGroup.Root) {
				$$renderer.push('<!--[-->');

				ButtonGroup.Root($$renderer, {
					class: 'rounded-btn-grp shrink-0 sm:hidden',
					children: ($$renderer) => {
						SubscribeMenu($$renderer, { compact: true });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (page.data.subMenuOptions?.showRssFeed !== false) {
			$$renderer.push('<!--[0-->');

			if (ButtonGroup.Root) {
				$$renderer.push('<!--[-->');

				ButtonGroup.Root($$renderer, {
					class: 'rounded-btn-grp shrink-0',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							size: 'icon-sm',
							href: rssHref(),
							target: '_blank',
							rel: 'alternate',
							'aria-label': $.store_get($$store_subs ??= {}, '$t', t)("RSS feed"),
							title: $.store_get($$store_subs ??= {}, '$t', t)("RSS feed"),
							class: 'bg-background/80 dark:bg-background/70 border-foreground/10 cursor-pointer rounded-full border shadow-none backdrop-blur-md',
							onclick: () => trackEvent("rss_opened", { source: "theme_plus" }),
							children: ($$renderer) => {
								Rss($$renderer, {});
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				class: 'rounded-btn-grp shrink-0',
				children: ($$renderer) => {
					CopyButton($$renderer, {
						variant: 'outline',
						text: shareLink,
						class: 'bg-background/80 dark:bg-background/70 border-foreground/10 cursor-pointer rounded-full border shadow-none backdrop-blur-md',
						size: 'icon-sm',
						onclick: () => trackEvent("share_link_copied", { source: "theme_plus" }),
						children: ($$renderer) => {
							Share($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BadgesMenu($$renderer, { protocol, domain });
					$$renderer.push(`<!----> `);
					EmbedMenu($$renderer, { protocol, domain });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				class: 'rounded-btn-grp shrink-0 sm:hidden',
				children: ($$renderer) => {
					if (page.data.isThemeToggleEnabled) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'outline',
							size: 'icon-sm',
							onclick: toggleMode,
							'aria-label': 'toggle theme mode',
							class: 'bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border shadow-none backdrop-blur-md',
							children: ($$renderer) => {
								if (mode.current === "light") {
									$$renderer.push('<!--[0-->');
									Sun($$renderer, { class: 'h-4 w-4' });
								} else {
									$$renderer.push('<!--[-1-->');
									Moon($$renderer, { class: 'h-4 w-4' });
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if ($.store_get($$store_subs ??= {}, '$i18n', i18n).availableLocales.length > 1) {
						$$renderer.push('<!--[0-->');
						LanguageSelector($$renderer, { compact: true });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (page.data.isTimezoneEnabled) {
						$$renderer.push('<!--[0-->');
						TimezoneSelector($$renderer, { compact: true });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				class: 'rounded-btn-grp hidden shrink-0 sm:flex',
				children: ($$renderer) => {
					if (page.data.isThemeToggleEnabled) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'outline',
							size: 'sm',
							onclick: toggleMode,
							'aria-label': 'toggle theme mode ',
							class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative rounded-full border shadow-none backdrop-blur-md',
							children: ($$renderer) => {
								Sun($$renderer, {
									class: 'absolute left-2  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
								});

								$$renderer.push(`<!----> `);

								Moon($$renderer, {
									class: 'absolute left-2  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
								});

								$$renderer.push(`<!----> <span class="pl-5 text-xs">${$.escape(mode.current === "light"
									? $.store_get($$store_subs ??= {}, '$t', t)("Light")
									: $.store_get($$store_subs ??= {}, '$t', t)("Dark"))}</span>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if ($.store_get($$store_subs ??= {}, '$i18n', i18n).availableLocales.length > 1) {
						$$renderer.push('<!--[0-->');
						LanguageSelector($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (page.data.isTimezoneEnabled) {
						$$renderer.push('<!--[0-->');
						TimezoneSelector($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (showNotificationsPopover()) {
			$$renderer.push('<!--[0-->');

			NotificationsPopover($$renderer, {
				eventsPath: eventsPath(),
				monitorTags: monitor_tags,
				compact: true
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (loginDetails()) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				size: 'sm',
				href: loginDetails().url,
				target: '_blank',
				class: 'bg-accent-foreground text-accent border-foreground/10 rounded-full border  text-xs font-semibold shadow-none  ',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(loginDetails().label)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (!!page.data.announcement && !!page.data.announcement.title && !!page.data.announcement.message) {
			$$renderer.push('<!--[0-->');
			SiteBanner($$renderer, { announcement: page.data.announcement });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}