import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import SettingsCategories from '../settings/SettingsCategories.svelte';

var root = $.from_html(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2"> </h2> <p class="text-gray-600 dark:text-gray-300 mb-2"> </p></div> <!></div>`);

export default function OnboardingStepCategories($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let categories = $.prop($$props, 'categories', 19, () => []);

	var div = root();
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	SettingsCategories(node, {
		get categories() {
			return categories();
		}
	});

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => s("onboarding.categories.title") || "Choose Your Topics",
			() => s("onboarding.categories.subtitle") || "Kagi News follows news from around the world, covering national, regional, and local events. Select the categories you're interested in:"
		]
	);

	$.append($$anchor, div);
	$.pop();
}