import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';

var root = $.from_html(`<div class="space-y-2"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <input type="range" min="3" max="12" aria-valuemin="3" aria-valuemax="12" class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"/> <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>3</span> <span>12</span></div></div>`);

export default function StoryCountSlider($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let id = $.prop($$props, 'id', 3, 'story-count-range');

	function handleChange(e) {
		const value = parseInt(e.currentTarget.value, 10);

		displaySettings.storyCount = value;
		settings.storyCount.save();
	}

	var div = root();
	var label = $.child(div);
	var text = $.only_child(label);
	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(label, 'for', id());
			$.set_text(text, `${$0 ?? ''}: ${displaySettings.storyCount ?? ''}`);
			$.set_attribute(input, 'id', id());
			$.set_value(input, displaySettings.storyCount);
			$.set_attribute(input, 'aria-valuenow', displaySettings.storyCount);
			$.set_attribute(input, 'aria-valuetext', `${displaySettings.storyCount ?? ''} ${displaySettings.storyCount === 1 ? 'story' : 'stories'}`);
		},
		[
			() => s("settings.storyCount.label") || "Stories per category"
		]
	);

	$.delegated('input', input, handleChange);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);