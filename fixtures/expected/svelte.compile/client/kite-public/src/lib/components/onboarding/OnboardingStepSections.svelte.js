import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import SectionsList from '$lib/components/settings/snippets/SectionsList.svelte';

var root = $.from_html(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2"> </h2> <p class="text-gray-600 dark:text-gray-300"> </p></div> <!></div>`);

export default function OnboardingStepSections($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	SectionsList(node, { showHeader: false, showResetButton: false });
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => s("onboarding.sections.title") || "Content Preferences",
			() => s("onboarding.sections.subtitle") || "Choose which sections to display in your news stories:"
		]
	);

	$.append($$anchor, div);
	$.pop();
}