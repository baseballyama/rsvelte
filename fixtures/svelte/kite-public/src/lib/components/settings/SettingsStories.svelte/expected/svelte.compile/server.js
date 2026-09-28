import * as $ from 'svelte/internal/server';
import { IconX } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';
import { preferredSources } from '$lib/stores/preferredSources.svelte.js';
import SectionsList from './snippets/SectionsList.svelte';
import StoryCountSlider from './snippets/StoryCountSlider.svelte';

export default function SettingsStories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let currentStoryExpandMode = displaySettings.storyExpandMode;

		let currentStoryOpenMode = displaySettings.storyOpenMode;
		let currentMapsProvider = displaySettings.mapsProvider;

		// Sync local state with stores
		function handleStoryExpandModeChange(mode) {
			displaySettings.storyExpandMode = mode;
			settings.storyExpandMode.save();
			currentStoryExpandMode = mode;
		}

		function handleStoryOpenModeChange(mode) {
			displaySettings.storyOpenMode = mode;
			settings.storyOpenMode.save();
			currentStoryOpenMode = mode;
		}

		function handleMapsProviderChange(provider) {
			displaySettings.mapsProvider = provider;
			settings.mapsProvider.save();
			currentMapsProvider = provider;
		}

		// --- Pinned Sources State ---
		let showSourcesClearConfirmation = false;

		function handleClearSources() {
			preferredSources.clear();
			showSourcesClearConfirmation = true;

			setTimeout(
				() => {
					showSourcesClearConfirmation = false;
				},
				1000
			);
		}

		function handleRemoveSource(domain) {
			preferredSources.removePreferred(domain);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.storyDisplay") || "Story Display")}</h3> <div class="space-y-4 ps-2">`);
			StoryCountSlider($$renderer, {});
			$$renderer.push(`<!----> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: storyOpenModeOptions(),
				label: s("settings.storyOpenMode.label") || "Story Open Mode",
				onChange: handleStoryOpenModeChange,
				get value() {
					return currentStoryOpenMode;
				},

				set value($$value) {
					currentStoryOpenMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.storyOpenMode.description") || "Choose whether to allow multiple stories open at once or only one")}</p></div> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: storyExpandModeOptions(),
				label: s("settings.storyExpandMode.label") || "Story Expand Mode",
				onChange: handleStoryExpandModeChange,
				get value() {
					return currentStoryExpandMode;
				},

				set value($$value) {
					currentStoryExpandMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.storyExpandMode.description") || "Choose how stories expand in a category")}</p></div> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: mapsProviderOptions(),
				label: s("settings.mapsProvider.label") || "Maps Provider",
				onChange: handleMapsProviderChange,
				get value() {
					return currentMapsProvider;
				},

				set value($$value) {
					currentMapsProvider = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.mapsProvider.description") || "Choose which maps service to use for location links")}</p></div></div></div> `);
			SectionsList($$renderer, {});
			$$renderer.push(`<!----> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.preferredSources.title") || "Pinned Sources")}</h3> <div class="ps-2"><p class="text-xs text-gray-500 dark:text-gray-400 mb-3">${$.escape(s("settings.preferredSources.description") || "Pinned sources appear first in each story's source list. Click the pin icon on any source to add it here.")}</p> `);

			if (preferredSources.list.length === 0) {
				$$renderer.push(`<!--[0--><div class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">${$.escape(s("settings.preferredSources.empty") || "No pinned sources yet. Open a story, click on a source, and use the pin icon to add it here.")}</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="space-y-2"><!--[-->`);

				const each_array = $.ensure_array_like(preferredSources.list);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let domain = each_array[$$index];

					$$renderer.push(`<div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"><div class="flex items-center space-x-3">`);

					FaviconImage($$renderer, {
						domain,
						alt: `${$.stringify(domain)} favicon`,
						class: 'h-5 w-5 rounded-sm'
					});

					$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(domain)}</span></div> <button class="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus-visible-ring rounded p-1"${$.attr('aria-label', s("settings.preferredSources.remove") || `Remove ${domain} from pinned sources`)}>`);
					IconX($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----></button></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="text-center mt-4">`);

				if (showSourcesClearConfirmation) {
					$$renderer.push(`<!--[0--><span class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="inline-block"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path></svg> ${$.escape(s("settings.preferredSources.cleared") || "Cleared!")}</span>`);
				} else {
					$$renderer.push(`<!--[-1--><button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded">${$.escape(s("settings.preferredSources.clearAll") || "Clear all pinned sources")}</button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}