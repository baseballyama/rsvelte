import * as $ from 'svelte/internal/server';
import Check from "@lucide/svelte/icons/check";
import { t } from "$lib/stores/i18n";

export default function EventsCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { statusClass, statusText } = $$props;

		$$renderer.push(`<div class="flex flex-col gap-3 lg:flex-row"><div class="flex min-h-20 w-full flex-row justify-start gap-y-3 rounded-3xl border p-4 lg:w-full lg:min-w-72"><div class="flex w-full flex-row items-center gap-4"><div class="relative flex justify-between"><span class="relative flex size-4"><span${$.attr_class(`${$.stringify(
			// Compute change info (direction, color, and formatted value)
			statusClass
		)} absolute inline-flex h-full w-full animate-ping rounded-full opacity-75`)}></span> <span${$.attr_class(`${$.stringify(statusClass)} relative inline-flex size-4 rounded-full`)}></span></span></div> <div class="flex min-w-0 flex-col items-start gap-2"><p class="text-xl leading-tight wrap-break-word sm:text-2xl">${$.escape($.store_get($$store_subs ??= {}, '$t', t)(statusText))}</p></div></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}