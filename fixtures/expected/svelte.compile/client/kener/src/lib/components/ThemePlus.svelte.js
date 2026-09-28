import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <span class="pl-5 text-xs"> </span>`, 1);
var root_2 = $.from_html(`<div class="theme-plus-bar scrollbar-hidden sticky top-18 z-20 flex w-full items-center gap-2 rounded py-2"><!> <div class="ml-auto flex shrink-0 items-center gap-2"><!> <!> <!> <!> <!> <!> <!> <!></div></div> <!>`, 1);

export default function ThemePlus($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $i18n = () => $.store_get(i18n, '$i18n', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let monitor_tags = $.prop($$props, 'monitor_tags', 19, () => []),
		embedMonitorTag = $.prop($$props, 'embedMonitorTag', 3, ""),
		hideNotificationsPopover = $.prop($$props, 'hideNotificationsPopover', 3, false);

	let protocol = $.state("");
	let domain = $.state("");
	let shareLink = $.state("");
	const eventsPath = $.derived(() => `/events/${format(new Date(), "MMMM-yyyy")}`);
	const showNotificationsPopover = $.derived(() => !hideNotificationsPopover());

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
				label: $t()("Edit Monitor"),
				url: clientResolver(resolve, "/manage/app/monitors/" + page.params.monitor_tag)
			};
		} else if (page.route.id === "/(kener)/incidents/[incident_id]") {
			return {
				label: $t()("Update Incident"),
				url: clientResolver(resolve, "/manage/app/incidents/" + page.params.incident_id)
			};
		} else if (page.route.id === "/(kener)/maintenances/[maintenance_id]") {
			return {
				label: $t()("Update Maintenance"),
				url: clientResolver(resolve, "/manage/app/maintenances/" + page.data.maintenance.id)
			};
		} else {
			return {
				label: $t()("Manage Site"),
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
		$.set(protocol, window.location.protocol, true);
		$.set(domain, window.location.host, true);
		$.set(shareLink, window.location.href, true);
	});

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			PageSelector($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (!!!page.data.globalPageVisibilitySettings.forceExclusivity && page.data.globalPageVisibilitySettings.showSwitcher) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
				ButtonGroup_Root($$anchor, {
					class: 'hidden shrink-0 sm:flex',
					children: ($$anchor, $$slotProps) => {
						SubscribeMenu($$anchor, {});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (page.data.isSubsEnabled && page.data.canSendEmail) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.component(node_4, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
				ButtonGroup_Root_1($$anchor, {
					class: 'rounded-btn-grp shrink-0 sm:hidden',
					children: ($$anchor, $$slotProps) => {
						SubscribeMenu($$anchor, { compact: true });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_3, ($$render) => {
			if (page.data.isSubsEnabled && page.data.canSendEmail) $$render(consequent_2);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_6 = $.first_child(fragment_6);

			$.component(node_6, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
				ButtonGroup_Root_2($$anchor, {
					class: 'rounded-btn-grp shrink-0',
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $t()("RSS feed"));
							let $1 = $.derived(() => $t()("RSS feed"));

							Button($$anchor, {
								variant: 'outline',
								size: 'icon-sm',
								get href() {
									return $.get(rssHref);
								},
								target: '_blank',
								rel: 'alternate',
								get 'aria-label'() {
									return $.get($0);
								},

								get title() {
									return $.get($1);
								},
								class: 'bg-background/80 dark:bg-background/70 border-foreground/10 cursor-pointer rounded-full border shadow-none backdrop-blur-md',
								onclick: () => trackEvent("rss_opened", { source: "theme_plus" }),
								children: ($$anchor, $$slotProps) => {
									Rss($$anchor, {});
								},
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_5, ($$render) => {
			if (page.data.subMenuOptions?.showRssFeed !== false) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	$.component(node_7, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_3) => {
		ButtonGroup_Root_3($$anchor, {
			class: 'rounded-btn-grp shrink-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_8 = $.first_child(fragment_9);

				CopyButton(node_8, {
					variant: 'outline',
					get text() {
						return $.get(shareLink);
					},
					class: 'bg-background/80 dark:bg-background/70 border-foreground/10 cursor-pointer rounded-full border shadow-none backdrop-blur-md',
					size: 'icon-sm',
					onclick: () => trackEvent("share_link_copied", { source: "theme_plus" }),
					children: ($$anchor, $$slotProps) => {
						Share($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				BadgesMenu(node_9, {
					get protocol() {
						return $.get(protocol);
					},

					get domain() {
						return $.get(domain);
					}
				});

				var node_10 = $.sibling(node_9, 2);

				EmbedMenu(node_10, {
					get protocol() {
						return $.get(protocol);
					},

					get domain() {
						return $.get(domain);
					}
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	var node_11 = $.sibling(node_7, 2);

	$.component(node_11, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_4) => {
		ButtonGroup_Root_4($$anchor, {
			class: 'rounded-btn-grp shrink-0 sm:hidden',
			children: ($$anchor, $$slotProps) => {
				var fragment_11 = root();
				var node_12 = $.first_child(fragment_11);

				{
					var consequent_5 = ($$anchor) => {
						Button($$anchor, {
							variant: 'outline',
							size: 'icon-sm',
							onclick: toggleMode,
							'aria-label': 'toggle theme mode',
							class: 'bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border shadow-none backdrop-blur-md',
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = $.comment();
								var node_13 = $.first_child(fragment_13);

								{
									var consequent_4 = ($$anchor) => {
										Sun($$anchor, { class: 'h-4 w-4' });
									};

									var alternate = ($$anchor) => {
										Moon($$anchor, { class: 'h-4 w-4' });
									};

									$.if(node_13, ($$render) => {
										if (mode.current === "light") $$render(consequent_4); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_12, ($$render) => {
						if (page.data.isThemeToggleEnabled) $$render(consequent_5);
					});
				}

				var node_14 = $.sibling(node_12, 2);

				{
					var consequent_6 = ($$anchor) => {
						LanguageSelector($$anchor, { compact: true });
					};

					$.if(node_14, ($$render) => {
						if ($i18n().availableLocales.length > 1) $$render(consequent_6);
					});
				}

				var node_15 = $.sibling(node_14, 2);

				{
					var consequent_7 = ($$anchor) => {
						TimezoneSelector($$anchor, { compact: true });
					};

					$.if(node_15, ($$render) => {
						if (page.data.isTimezoneEnabled) $$render(consequent_7);
					});
				}

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_11, 2);

	$.component(node_16, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_5) => {
		ButtonGroup_Root_5($$anchor, {
			class: 'rounded-btn-grp hidden shrink-0 sm:flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_18 = root();
				var node_17 = $.first_child(fragment_18);

				{
					var consequent_8 = ($$anchor) => {
						Button($$anchor, {
							variant: 'outline',
							size: 'sm',
							onclick: toggleMode,
							'aria-label': 'toggle theme mode ',
							class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative rounded-full border shadow-none backdrop-blur-md',
							children: ($$anchor, $$slotProps) => {
								var fragment_20 = root_1();
								var node_18 = $.first_child(fragment_20);

								Sun(node_18, {
									class: 'absolute left-2  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
								});

								var node_19 = $.sibling(node_18, 2);

								Moon(node_19, {
									class: 'absolute left-2  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
								});

								var span = $.sibling(node_19, 2);
								var text = $.only_child(span, true);

								$.template_effect(($0) => $.set_text(text, $0), [
									() => mode.current === "light" ? $t()("Light") : $t()("Dark")
								]);

								$.append($$anchor, fragment_20);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_17, ($$render) => {
						if (page.data.isThemeToggleEnabled) $$render(consequent_8);
					});
				}

				var node_20 = $.sibling(node_17, 2);

				{
					var consequent_9 = ($$anchor) => {
						LanguageSelector($$anchor, {});
					};

					$.if(node_20, ($$render) => {
						if ($i18n().availableLocales.length > 1) $$render(consequent_9);
					});
				}

				var node_21 = $.sibling(node_20, 2);

				{
					var consequent_10 = ($$anchor) => {
						TimezoneSelector($$anchor, {});
					};

					$.if(node_21, ($$render) => {
						if (page.data.isTimezoneEnabled) $$render(consequent_10);
					});
				}

				$.append($$anchor, fragment_18);
			},
			$$slots: { default: true }
		});
	});

	var node_22 = $.sibling(node_16, 2);

	{
		var consequent_11 = ($$anchor) => {
			NotificationsPopover($$anchor, {
				get eventsPath() {
					return $.get(eventsPath);
				},

				get monitorTags() {
					return monitor_tags();
				},
				compact: true
			});
		};

		$.if(node_22, ($$render) => {
			if ($.get(showNotificationsPopover)) $$render(consequent_11);
		});
	}

	var node_23 = $.sibling(node_22, 2);

	{
		var consequent_12 = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				get href() {
					return $.get(loginDetails).url;
				},
				target: '_blank',
				class: 'bg-accent-foreground text-accent border-foreground/10 rounded-full border  text-xs font-semibold shadow-none  ',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $.get(loginDetails).label));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_23, ($$render) => {
			if ($.get(loginDetails)) $$render(consequent_12);
		});
	}

	$.reset(div_1);
	$.reset(div);

	var node_24 = $.sibling(div, 2);

	{
		var consequent_13 = ($$anchor) => {
			SiteBanner($$anchor, {
				get announcement() {
					return page.data.announcement;
				}
			});
		};

		$.if(node_24, ($$render) => {
			if (!!page.data.announcement && !!page.data.announcement.title && !!page.data.announcement.message) $$render(consequent_13);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}