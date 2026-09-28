import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="my-0.5 flex items-center justify-between gap-2 text-xs"><span class="text-muted-foreground text-[11px] uppercase"> </span> <span> </span></div> <div class="flex items-start justify-between gap-2"><p class="line-clamp-2 text-sm"> </p></div> <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs"><span> </span> <span>•</span> <span> </span></div>`, 1);
var root_1 = $.from_html(`<div class="text-muted-foreground px-4 py-6 text-center text-sm"> </div>`);
var root_2 = $.from_html(`<a class="hover:bg-muted/60 block border-b px-4 py-3 last:border-b-0"><!></a>`);
var root_3 = $.from_html(`<div class="scrollbar-hidden max-h-96 overflow-y-auto"></div>`);
var root_4 = $.from_html(`<div class="flex items-center justify-between border-b px-4 py-3"><h4 class="text-sm font-semibold"> </h4> <!></div> <!>`, 1);

export default function NotificationsList($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $formatDuration = () => $.store_get(formatDuration, '$formatDuration', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const // silently fail
	notificationItem = ($$anchor, item = $.noop) => {
		var fragment = root();
		var div = $.first_child(fragment);
		var span = $.child(div);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div);

		var div_1 = $.sibling(div, 2);
		var p = $.child(div_1);
		var text_2 = $.only_child(p, true);

		$.reset(div_1);

		var div_2 = $.sibling(div_1, 2);
		var span_2 = $.child(div_2);
		var text_3 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 4);
		var text_4 = $.only_child(span_3, true);

		$.reset(div_2);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_text(text, $0);
				$.set_class(span_1, 1, `text-${$1 ?? ''}`);
				$.set_text(text_1, $2);
				$.set_text(text_2, item().eventTitle);
				$.set_text(text_3, $3);
				$.set_text(text_4, $4);
			},
			[
				() => $t()(item().eventType),
				() => item().eventStatus.toLowerCase(),
				() => $t()(item().eventStatus),
				() => $formatDate()(item().eventDate, page.data.dateAndTimeFormat.datePlusTime),
				() => $formatDuration()(item().eventStartDateTime, item().eventEndDateTime, $t()("Ongoing"))
			]
		);

		$.append($$anchor, fragment);
	};

	let monitorTags = $.prop($$props, 'monitorTags', 19, () => []),
		eventsPath = $.prop($$props, 'eventsPath', 3, ""),
		notifications = $.prop($$props, 'notifications', 31, () => $.proxy([])),
		loading = $.prop($$props, 'loading', 15, false),
		fetchOnMount = $.prop($$props, 'fetchOnMount', 3, true);

	const defaultEventsPath = $.derived(() => `/events/${format(new Date(), "MMMM-yyyy")}`);

	const resolvedEventsPath = $.derived(() => {
		const finalEventsPath = eventsPath() || $.get(defaultEventsPath);

		if (page.data?.globalPageVisibilitySettings?.forceExclusivity) {
			const currentPagePath = page.params?.page_path?.trim();

			return currentPagePath
				? `/${currentPagePath}${finalEventsPath}`
				: finalEventsPath;
		}

		return finalEventsPath;
	});

	async function fetchNotifications() {
		loading(true);

		try {
			notifications(await requestNotifications(monitorTags()));
		} catch {
			// silently fail
		} finally {
			loading(false);
		}
	}

	onMount(() => {
		if (fetchOnMount()) {
			void fetchNotifications();
		}
	});

	function getEventId(eventURL) {
		return eventURL.split("/").filter(Boolean).at(-1) || "";
	}

	var fragment_1 = root_4();
	var div_3 = $.first_child(fragment_1);
	var h4 = $.child(div_3);
	var text_5 = $.only_child(h4, true);
	var node = $.sibling(h4, 2);

	{
		let $0 = $.derived(() => clientResolver(resolve, $.get(resolvedEventsPath)));
		let $1 = $.derived(() => $t()("Open events page"));
		let $2 = $.derived(() => $t()("Open events page"));

		Button(node, {
			variant: 'outline',
			get href() {
				return $.get($0);
			},
			size: 'icon-sm',
			class: 'rounded-btn',
			get 'aria-label'() {
				return $.get($1);
			},

			get title() {
				return $.get($2);
			},

			children: ($$anchor, $$slotProps) => {
				Calendar($$anchor, { class: 'size-4' });
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_3);

	var node_1 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root_1();
			var text_6 = $.only_child(div_4, true);

			$.template_effect(($0) => $.set_text(text_6, $0), [() => $t()("No events to show")]);
			$.append($$anchor, div_4);
		};

		var alternate_1 = ($$anchor) => {
			var div_5 = root_3();

			$.each(div_5, 23, notifications, (item, i) => `${item.eventType}-${item.eventURL}-${item.eventDate}-${i}`, ($$anchor, item) => {
				const eventId = $.derived(() => getEventId($.get(item).eventURL));
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				{
					var consequent_1 = ($$anchor) => {
						var a = root_2();
						var node_3 = $.child(a);

						notificationItem(node_3, () => $.get(item));
						$.reset(a);

						$.template_effect(($0) => $.set_attribute(a, 'href', $0), [
							() => resolve("/(kener)/incidents/[incident_id]", { incident_id: $.get(eventId) })
						]);

						$.append($$anchor, a);
					};

					var d = $.derived(() => $.get(item).eventURL.startsWith("/incidents/"));

					var alternate = ($$anchor) => {
						var a_1 = root_2();
						var node_4 = $.child(a_1);

						notificationItem(node_4, () => $.get(item));
						$.reset(a_1);

						$.template_effect(($0) => $.set_attribute(a_1, 'href', $0), [
							() => resolve("/(kener)/maintenances/[maintenance_id]", { maintenance_id: $.get(eventId) })
						]);

						$.append($$anchor, a_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_1, ($$render) => {
			if (notifications().length === 0) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.template_effect(($0) => $.set_text(text_5, $0), [() => $t()("Events")]);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}