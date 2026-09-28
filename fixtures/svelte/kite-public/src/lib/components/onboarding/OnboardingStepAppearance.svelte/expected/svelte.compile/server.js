import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import DataLanguageSelector from '../settings/snippets/DataLanguageSelector.svelte';
import LanguageSelector from '../settings/snippets/LanguageSelector.svelte';
import StoryCountSlider from '../settings/snippets/StoryCountSlider.svelte';
import ThemeSelector from '../settings/snippets/ThemeSelector.svelte';

export default function OnboardingStepAppearance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${$.escape(s("onboarding.welcome.title") || "Welcome to Kagi News!")}</h2> <p class="text-gray-600 dark:text-gray-300">${$.escape(s("onboarding.welcome.subtitle") || "Let's personalize your news experience. First, choose your preferences:")}</p></div> `);
		ThemeSelector($$renderer, {});
		$$renderer.push(`<!----> `);
		LanguageSelector($$renderer, { showTooltip: true });
		$$renderer.push(`<!----> `);
		DataLanguageSelector($$renderer, { showTooltip: true });
		$$renderer.push(`<!----> `);
		StoryCountSlider($$renderer, { id: 'onboarding-story-count' });
		$$renderer.push(`<!----></div>`);
	});
}