import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { imagePreloadingService } from '$lib/services/imagePreloadingService';
import { preloadingConfig } from '$lib/stores/preloadingConfig.svelte';

var root = $.from_html(`<div class="space-y-4"><h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Image Preloading (Debug)</h3> <div class="flex items-center justify-between"><label for="preloading-enabled" class="text-sm text-gray-700 dark:text-gray-300">Enable image preloading</label> <input id="preloading-enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></div> <div class="flex items-center justify-between"><label for="preloading-mobile" class="text-sm text-gray-700 dark:text-gray-300">Enable on mobile devices <span class="block text-xs text-gray-500 dark:text-gray-400">May increase data usage</span></label> <input id="preloading-mobile" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></div> <div class="space-y-2"><label for="category-delay" class="text-sm text-gray-700 dark:text-gray-300">Category preload delay (ms)</label> <input id="category-delay" type="range" min="0" max="2000" step="100" aria-valuemin="0" aria-valuemax="2000" class="w-full"/> <div class="text-xs text-gray-500 dark:text-gray-400 text-end"> </div></div> <div class="space-y-2"><label for="preload-timeout" class="text-sm text-gray-700 dark:text-gray-300">Desktop preload timeout (ms) <span class="block text-xs text-gray-500 dark:text-gray-400">Cancels slow downloads after this time</span></label> <input id="preload-timeout" type="range" min="0" max="5000" step="500" aria-valuemin="0" aria-valuemax="5000" class="w-full"/> <div class="text-xs text-gray-500 dark:text-gray-400 text-end"> </div></div> <div class="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Cache Statistics</h4> <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400"><div class="flex justify-between"><span>Cached images:</span> <span class="font-mono"> </span></div> <div class="flex justify-between"><span>Downloading:</span> <span class="font-mono"> </span></div> <div class="flex justify-between"><span>Active preloads:</span> <span class="font-mono"> </span></div></div> <button class="mt-3 w-full px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Clear Image Cache</button></div> <div class="flex items-center justify-between"><label for="debug-logging" class="text-sm text-gray-700 dark:text-gray-300">Enable debug logging</label> <input id="debug-logging" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></div></div>`);

export default function SettingsImagePreloading($$anchor, $$props) {
	$.push($$props, true);

	// Get current cache stats
	let cacheStats = $.state($.proxy(imagePreloadingService.getCacheStats()));

	// Update cache stats periodically
	let statsInterval;

	$.user_effect(() => {
		statsInterval = setInterval(
			() => {
				$.set(cacheStats, imagePreloadingService.getCacheStats(), true);
			},
			1000
		);

		return () => clearInterval(statsInterval);
	});

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var input = $.sibling($.child(div_1), 2);

	$.remove_input_defaults(input);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var input_1 = $.sibling($.child(div_2), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var input_2 = $.sibling($.child(div_3), 2);

	$.remove_input_defaults(input_2);

	var div_4 = $.sibling(input_2, 2);
	var text = $.only_child(div_4);

	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var input_3 = $.sibling($.child(div_5), 2);

	$.remove_input_defaults(input_3);

	var div_6 = $.sibling(input_3, 2);
	var text_1 = $.only_child(div_6, true);

	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var div_9 = $.child(div_8);
	var span = $.sibling($.child(div_9), 2);
	var text_2 = $.only_child(span, true);

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var span_1 = $.sibling($.child(div_10), 2);
	var text_3 = $.only_child(span_1, true);

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var span_2 = $.sibling($.child(div_11), 2);
	var text_4 = $.only_child(span_2, true);

	$.reset(div_11);
	$.reset(div_8);

	var button = $.sibling(div_8, 2);

	$.reset(div_7);

	var div_12 = $.sibling(div_7, 2);
	var input_4 = $.sibling($.child(div_12), 2);

	$.remove_input_defaults(input_4);
	$.reset(div_12);
	$.reset(div);

	$.template_effect(() => {
		$.set_checked(input, preloadingConfig.enabled);
		$.set_checked(input_1, preloadingConfig.enableOnMobile);
		$.set_value(input_2, preloadingConfig.categoryPreloadDelay);
		$.set_attribute(input_2, 'aria-valuenow', preloadingConfig.categoryPreloadDelay);
		$.set_attribute(input_2, 'aria-valuetext', `${preloadingConfig.categoryPreloadDelay ?? ''} milliseconds`);
		$.set_text(text, `${preloadingConfig.categoryPreloadDelay ?? ''}ms`);
		$.set_value(input_3, preloadingConfig.preloadTimeout);
		$.set_attribute(input_3, 'aria-valuenow', preloadingConfig.preloadTimeout);

		$.set_attribute(input_3, 'aria-valuetext', preloadingConfig.preloadTimeout === 0
			? 'Disabled'
			: `${preloadingConfig.preloadTimeout} milliseconds`);

		$.set_text(text_1, preloadingConfig.preloadTimeout === 0 ? "Disabled" : `${preloadingConfig.preloadTimeout}ms`);
		$.set_text(text_2, $.get(cacheStats).cachedCount);
		$.set_text(text_3, $.get(cacheStats).downloadingCount);
		$.set_text(text_4, $.get(cacheStats).downloadingCount || 0);
		$.set_checked(input_4, preloadingConfig.debugLogging);
	});

	$.delegated('change', input, (e) => preloadingConfig.setEnabled(e.currentTarget.checked));
	$.delegated('change', input_1, (e) => preloadingConfig.setEnableOnMobile(e.currentTarget.checked));
	$.delegated('input', input_2, (e) => preloadingConfig.setCategoryPreloadDelay(parseInt(e.currentTarget.value)));
	$.delegated('input', input_3, (e) => preloadingConfig.setPreloadTimeout(parseInt(e.currentTarget.value)));

	$.delegated('click', button, () => {
		imagePreloadingService.clearCache();
		$.set(cacheStats, imagePreloadingService.getCacheStats(), true);
	});

	$.delegated('change', input_4, (e) => preloadingConfig.setDebugLogging(e.currentTarget.checked));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'input', 'click']);