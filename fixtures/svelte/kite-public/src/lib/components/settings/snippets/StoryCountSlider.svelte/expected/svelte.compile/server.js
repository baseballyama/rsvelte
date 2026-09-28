import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';

export default function StoryCountSlider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { id = 'story-count-range' } = $$props;

		function handleChange(e) {
			const value = parseInt(e.currentTarget.value, 10);

			displaySettings.storyCount = value;
			settings.storyCount.save();
		}

		$$renderer.push(`<div class="space-y-2"><label${$.attr('for', id)} class="block text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.storyCount.label") || "Stories per category")}: ${$.escape(displaySettings.storyCount)}</label> <input${$.attr('id', id)} type="range" min="3" max="12"${$.attr('value', displaySettings.storyCount)} aria-valuemin="3" aria-valuemax="12"${$.attr('aria-valuenow', displaySettings.storyCount)}${$.attr('aria-valuetext', `${$.stringify(displaySettings.storyCount)} ${displaySettings.storyCount === 1 ? 'story' : 'stories'}`)} class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"/> <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>3</span> <span>12</span></div></div>`);
	});
}