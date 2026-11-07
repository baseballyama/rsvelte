import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<div class="flex items-center space-x-2"><button><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg></button> <button><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg></button></div>`);

export default function ViewModeToggle($$anchor, $$props) {
	$.push($$props, true);

	// Props
	function handleListClick() {
		$$props.onViewModeChange('list');
	}

	function handleMapClick() {
		$$props.onViewModeChange('map');
	}

	var div = root();
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_class(button, 1, `flex items-center justify-center p-2 rounded-md transition-colors ${$$props.viewMode === "list"
				? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
				: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`);

			$.set_attribute(button, 'aria-label', $0);
			$.set_attribute(button, 'title', $1);

			$.set_class(button_1, 1, `flex items-center justify-center p-2 rounded-md transition-colors ${$$props.viewMode === "map"
				? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
				: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`);

			$.set_attribute(button_1, 'aria-label', $2);
			$.set_attribute(button_1, 'title', $3);
		},
		[
			() => s("view.list") || "List view",
			() => s("view.list") || "List view",
			() => s("view.map") || "Map view",
			() => s("view.map") || "Map view"
		]
	);

	$.delegated('click', button, handleListClick);
	$.delegated('click', button_1, handleMapClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);