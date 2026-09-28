import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconX } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';
import { preferredSources } from '$lib/stores/preferredSources.svelte.js';
import SectionsList from './snippets/SectionsList.svelte';
import StoryCountSlider from './snippets/StoryCountSlider.svelte';

var root = $.from_html(`<div class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"> </div>`);
var root_1 = $.from_html(`<div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"><div class="flex items-center space-x-3"><!> <span class="text-sm font-medium text-gray-700 dark:text-gray-300"> </span></div> <button class="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus-visible-ring rounded p-1"><!></button></div>`);
var root_2 = $.from_html(`<span class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="inline-block"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path></svg> </span>`);
var root_3 = $.from_html(`<button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded"> </button>`);
var root_4 = $.from_html(`<div class="space-y-2"></div> <div class="text-center mt-4"><!></div>`, 1);
var root_5 = $.from_html(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div></div></div> <!> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2"><p class="text-xs text-gray-500 dark:text-gray-400 mb-3"> </p> <!></div></div></div>`);

export default function SettingsStories($$anchor, $$props) {
	$.push($$props, true);

	// Story expand mode options for display
	const storyExpandModeOptions = $.derived(() => [
		{
			value: 'always',
			label: s('settings.storyExpandMode.always') || 'Always expand all'
		},

		{
			value: 'doubleClick',
			label: s('settings.storyExpandMode.doubleClick') || 'Double-click to expand all'
		},

		{
			value: 'never',
			label: s('settings.storyExpandMode.never') || 'Never expand all'
		}
	]);

	// Story open mode options for display
	const storyOpenModeOptions = $.derived(() => [
		{
			value: 'multiple',
			label: s('settings.storyOpenMode.multiple') || 'Multiple stories'
		},

		{
			value: 'single',
			label: s('settings.storyOpenMode.single') || 'One story at a time'
		}
	]);

	// Maps provider options
	const mapsProviderOptions = $.derived(() => [
		{
			value: 'auto',
			label: s('settings.mapsProvider.auto') || 'Auto'
		},

		{
			value: 'kagi',
			label: s('settings.mapsProvider.kagi') || 'Kagi Maps'
		},

		{
			value: 'google',
			label: s('settings.mapsProvider.google') || 'Google Maps'
		},

		{
			value: 'openstreetmap',
			label: s('settings.mapsProvider.openstreetmap') || 'OpenStreetMap'
		},

		{
			value: 'apple',
			label: s('settings.mapsProvider.apple') || 'Apple Maps'
		}
	]);

	// Local state for story settings
	let currentStoryExpandMode = $.state($.proxy(displaySettings.storyExpandMode));

	let currentStoryOpenMode = $.state($.proxy(displaySettings.storyOpenMode));
	let currentMapsProvider = $.state($.proxy(displaySettings.mapsProvider));

	// Sync local state with stores
	$.user_effect(() => {
		$.set(currentStoryExpandMode, displaySettings.storyExpandMode, true);
	});

	$.user_effect(() => {
		$.set(currentStoryOpenMode, displaySettings.storyOpenMode, true);
	});

	$.user_effect(() => {
		$.set(currentMapsProvider, displaySettings.mapsProvider, true);
	});

	function handleStoryExpandModeChange(mode) {
		displaySettings.storyExpandMode = mode;
		settings.storyExpandMode.save();
		$.set(currentStoryExpandMode, mode, true);
	}

	function handleStoryOpenModeChange(mode) {
		displaySettings.storyOpenMode = mode;
		settings.storyOpenMode.save();
		$.set(currentStoryOpenMode, mode, true);
	}

	function handleMapsProviderChange(provider) {
		displaySettings.mapsProvider = provider;
		settings.mapsProvider.save();
		$.set(currentMapsProvider, provider, true);
	}

	// --- Pinned Sources State ---
	let showSourcesClearConfirmation = $.state(false);

	function handleClearSources() {
		preferredSources.clear();
		$.set(showSourcesClearConfirmation, true);

		setTimeout(
			() => {
				$.set(showSourcesClearConfirmation, false);
			},
			1000
		);
	}

	function handleRemoveSource(domain) {
		preferredSources.removePreferred(domain);
	}

	var div = root_5();
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var div_2 = $.sibling(h3, 2);
	var node = $.child(div_2);

	StoryCountSlider(node, {});

	var div_3 = $.sibling(node, 2);
	var node_1 = $.child(div_3);

	{
		let $0 = $.derived(() => s("settings.storyOpenMode.label") || "Story Open Mode");

		Select(node_1, {
			get options() {
				return $.get(storyOpenModeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleStoryOpenModeChange,
			get value() {
				return $.get(currentStoryOpenMode);
			},

			set value($$value) {
				$.set(currentStoryOpenMode, $$value, true);
			}
		});
	}

	var p = $.sibling(node_1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	{
		let $0 = $.derived(() => s("settings.storyExpandMode.label") || "Story Expand Mode");

		Select(node_2, {
			get options() {
				return $.get(storyExpandModeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleStoryExpandModeChange,
			get value() {
				return $.get(currentStoryExpandMode);
			},

			set value($$value) {
				$.set(currentStoryExpandMode, $$value, true);
			}
		});
	}

	var p_1 = $.sibling(node_2, 2);
	var text_2 = $.only_child(p_1, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_3 = $.child(div_5);

	{
		let $0 = $.derived(() => s("settings.mapsProvider.label") || "Maps Provider");

		Select(node_3, {
			get options() {
				return $.get(mapsProviderOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleMapsProviderChange,
			get value() {
				return $.get(currentMapsProvider);
			},

			set value($$value) {
				$.set(currentMapsProvider, $$value, true);
			}
		});
	}

	var p_2 = $.sibling(node_3, 2);
	var text_3 = $.only_child(p_2, true);

	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	SectionsList(node_4, {});

	var div_6 = $.sibling(node_4, 2);
	var h3_1 = $.child(div_6);
	var text_4 = $.only_child(h3_1, true);
	var div_7 = $.sibling(h3_1, 2);
	var p_3 = $.child(div_7);
	var text_5 = $.only_child(p_3, true);
	var node_5 = $.sibling(p_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_8 = root();
			var text_6 = $.only_child(div_8, true);

			$.template_effect(($0) => $.set_text(text_6, $0), [
				() => s("settings.preferredSources.empty") || "No pinned sources yet. Open a story, click on a source, and use the pin icon to add it here."
			]);

			$.append($$anchor, div_8);
		};

		var alternate_1 = ($$anchor) => {
			var fragment = root_4();
			var div_9 = $.first_child(fragment);

			$.each(div_9, 21, () => preferredSources.list, $.index, ($$anchor, domain) => {
				var div_10 = root_1();
				var div_11 = $.child(div_10);
				var node_6 = $.child(div_11);

				FaviconImage(node_6, {
					get domain() {
						return $.get(domain);
					},

					get alt() {
						return `${$.get(domain) ?? ''} favicon`;
					},
					class: 'h-5 w-5 rounded-sm'
				});

				var span = $.sibling(node_6, 2);
				var text_7 = $.only_child(span, true);

				$.reset(div_11);

				var button = $.sibling(div_11, 2);
				var node_7 = $.child(button);

				IconX(node_7, { class: 'h-4 w-4' });
				$.reset(button);
				$.reset(div_10);

				$.template_effect(
					($0) => {
						$.set_text(text_7, $.get(domain));
						$.set_attribute(button, 'aria-label', $0);
					},
					[
						() => s("settings.preferredSources.remove") || `Remove ${$.get(domain)} from pinned sources`
					]
				);

				$.delegated('click', button, () => handleRemoveSource($.get(domain)));
				$.append($$anchor, div_10);
			});

			$.reset(div_9);

			var div_12 = $.sibling(div_9, 2);
			var node_8 = $.child(div_12);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_2();
					var text_8 = $.sibling($.child(span_1));

					$.reset(span_1);
					$.template_effect(($0) => $.set_text(text_8, ` ${$0 ?? ''}`), [() => s("settings.preferredSources.cleared") || "Cleared!"]);
					$.append($$anchor, span_1);
				};

				var alternate = ($$anchor) => {
					var button_1 = root_3();
					var text_9 = $.only_child(button_1, true);

					$.template_effect(($0) => $.set_text(text_9, $0), [
						() => s("settings.preferredSources.clearAll") || "Clear all pinned sources"
					]);

					$.delegated('click', button_1, handleClearSources);
					$.append($$anchor, button_1);
				};

				$.if(node_8, ($$render) => {
					if ($.get(showSourcesClearConfirmation)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div_12);
			$.append($$anchor, fragment);
		};

		$.if(node_5, ($$render) => {
			if (preferredSources.list.length === 0) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);
			$.set_text(text_5, $5);
		},
		[
			() => s("settings.subsections.storyDisplay") || "Story Display",
			() => s("settings.storyOpenMode.description") || "Choose whether to allow multiple stories open at once or only one",
			() => s("settings.storyExpandMode.description") || "Choose how stories expand in a category",
			() => s("settings.mapsProvider.description") || "Choose which maps service to use for location links",
			() => s("settings.preferredSources.title") || "Pinned Sources",
			() => s("settings.preferredSources.description") || "Pinned sources appear first in each story's source list. Click the pin icon on any source to add it here."
		]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);