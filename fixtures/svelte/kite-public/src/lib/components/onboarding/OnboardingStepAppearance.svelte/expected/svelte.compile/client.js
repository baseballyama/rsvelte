import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import DataLanguageSelector from '../settings/snippets/DataLanguageSelector.svelte';
import LanguageSelector from '../settings/snippets/LanguageSelector.svelte';
import StoryCountSlider from '../settings/snippets/StoryCountSlider.svelte';
import ThemeSelector from '../settings/snippets/ThemeSelector.svelte';

var root = $.from_html(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2"> </h2> <p class="text-gray-600 dark:text-gray-300"> </p></div> <!> <!> <!> <!></div>`);

export default function OnboardingStepAppearance($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	ThemeSelector(node, {});

	var node_1 = $.sibling(node, 2);

	LanguageSelector(node_1, { showTooltip: true });

	var node_2 = $.sibling(node_1, 2);

	DataLanguageSelector(node_2, { showTooltip: true });

	var node_3 = $.sibling(node_2, 2);

	StoryCountSlider(node_3, { id: 'onboarding-story-count' });
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => s("onboarding.welcome.title") || "Welcome to Kagi News!",
			() => s("onboarding.welcome.subtitle") || "Let's personalize your news experience. First, choose your preferences:"
		]
	);

	$.append($$anchor, div);
	$.pop();
}