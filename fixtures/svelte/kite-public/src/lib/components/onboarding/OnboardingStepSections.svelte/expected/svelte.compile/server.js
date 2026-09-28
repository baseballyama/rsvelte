import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import SectionsList from '$lib/components/settings/snippets/SectionsList.svelte';

export default function OnboardingStepSections($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${$.escape(s("onboarding.sections.title") || "Content Preferences")}</h2> <p class="text-gray-600 dark:text-gray-300">${$.escape(s("onboarding.sections.subtitle") || "Choose which sections to display in your news stories:")}</p></div> `);
		SectionsList($$renderer, { showHeader: false, showResetButton: false });
		$$renderer.push(`<!----></div>`);
	});
}