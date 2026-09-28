import * as $ from 'svelte/internal/server';
import { resolve } from "$app/paths";
import { page } from "$app/state";
import { requestNotifications } from "$lib/client/notifications-client.js";
import clientResolver from "$lib/client/resolver.js";
import { Button } from "$lib/components/ui/button/index.js";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import { t } from "$lib/stores/i18n";
import Calendar from "@lucide/svelte/icons/calendar-1";
import { format } from "date-fns";
import { onMount } from "svelte";

export default function NotificationsList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			monitorTags = [],
			eventsPath = "",
			notifications = [],
			loading = false,
			fetchOnMount = true
		} = $$props;

		const defaultEventsPath = $.derived(() => `/events/${format(new Date(), "MMMM-yyyy")}`);

		const resolvedEventsPath = $.derived(() => {
			const finalEventsPath = eventsPath || defaultEventsPath();

			if (page.data?.globalPageVisibilitySettings?.forceExclusivity) {
				const currentPagePath = page.params?.page_path?.trim();

				return currentPagePath
					? `/${currentPagePath}${finalEventsPath}`
					: finalEventsPath;
			}

			return finalEventsPath;
		});

		async function fetchNotifications() {
			loading = true;

			try {
				notifications = await requestNotifications(monitorTags);
			} catch {
				// silently fail
			} finally {
				loading = false;
			}
		}

		onMount(() => {
			if (fetchOnMount) {
				void fetchNotifications();
			}
		});

		function getEventId(eventURL) {
			return eventURL.split("/").filter(Boolean).at(-1) || "";
		}

		function notificationItem($$renderer, item) {
			$$renderer.push(`<div class="my-0.5 flex items-center justify-between gap-2 text-xs"><span class="text-muted-foreground text-[11px] uppercase">${$.escape($.store_get($$store_subs ??= {}, '$t', t)(item.eventType))}</span> <span${$.attr_class(`text-${$.stringify(item.eventStatus.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(item.eventStatus))}</span></div> <div class="flex items-start justify-between gap-2"><p class="line-clamp-2 text-sm">${$.escape(item.eventTitle)}</p></div> <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs"><span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(item.eventDate, page.data.dateAndTimeFormat.datePlusTime))}</span> <span>•</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDuration', formatDuration)(item.eventStartDateTime, item.eventEndDateTime, $.store_get($$store_subs ??= {}, '$t', t)("Ongoing")))}</span></div>`);
		}

		$$renderer.push(`<div class="flex items-center justify-between border-b px-4 py-3"><h4 class="text-sm font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Events"))}</h4> `);

		Button($$renderer, {
			variant: 'outline',
			href: clientResolver(resolve, resolvedEventsPath()),
			size: 'icon-sm',
			class: 'rounded-btn',
			'aria-label': $.store_get($$store_subs ??= {}, '$t', t)("Open events page"),
			title: $.store_get($$store_subs ??= {}, '$t', t)("Open events page"),
			children: ($$renderer) => {
				Calendar($$renderer, { class: 'size-4' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (notifications.length === 0) {
			$$renderer.push(`<!--[0--><div class="text-muted-foreground px-4 py-6 text-center text-sm">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No events to show"))}</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="scrollbar-hidden max-h-96 overflow-y-auto"><!--[-->`);

			const each_array = $.ensure_array_like(notifications);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];
				const eventId = getEventId(item.eventURL);

				if (item.eventURL.startsWith("/incidents/")) {
					$$renderer.push(`<!--[0--><a${$.attr('href', resolve("/(kener)/incidents/[incident_id]", { incident_id: eventId }))} class="hover:bg-muted/60 block border-b px-4 py-3 last:border-b-0">`);
					notificationItem($$renderer, item);
					$$renderer.push(`<!----></a>`);
				} else {
					$$renderer.push(`<!--[-1--><a${$.attr('href', resolve("/(kener)/maintenances/[maintenance_id]", { maintenance_id: eventId }))} class="hover:bg-muted/60 block border-b px-4 py-3 last:border-b-0">`);
					notificationItem($$renderer, item);
					$$renderer.push(`<!----></a>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { notifications, loading });
	});
}