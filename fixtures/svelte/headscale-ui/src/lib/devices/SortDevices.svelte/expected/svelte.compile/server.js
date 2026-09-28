import * as $ from 'svelte/internal/server';
import { getDevices } from '$lib/common/apiFunctions.svelte';
import { deviceSortDirectionStore, deviceSortStore } from '$lib/common/stores.js';

export default function SortDevices($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function sortAction() {
			if ($.store_get($$store_subs ??= {}, '$deviceSortDirectionStore', deviceSortDirectionStore) == 'ascending') {
				$.store_set(deviceSortDirectionStore, 'descending');
			} else {
				$.store_set(deviceSortDirectionStore, 'ascending');
			}

			getDevices();
		}

		$$renderer.push(`<span class="flex"><button class="mx-1">`);

		if ($.store_get($$store_subs ??= {}, '$deviceSortDirectionStore', deviceSortDirectionStore) == 'ascending') {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path></svg>`);
		}

		$$renderer.push(`<!--]--></button> <span class="btn-group"><button${$.attr_class('btn btn-xs', void 0, {
			'btn-active': $.store_get($$store_subs ??= {}, '$deviceSortStore', deviceSortStore) == 'id'
		})}>ID</button> <button${$.attr_class('btn btn-xs capitalize', void 0, {
			'btn-active': $.store_get($$store_subs ??= {}, '$deviceSortStore', deviceSortStore) == 'givenName'
		})}>Device Name</button> <button${$.attr_class('btn btn-xs capitalize', void 0, {
			'btn-active': $.store_get($$store_subs ??= {}, '$deviceSortStore', deviceSortStore) == 'lastSeen'
		})}>Last Seen</button></span></span>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}