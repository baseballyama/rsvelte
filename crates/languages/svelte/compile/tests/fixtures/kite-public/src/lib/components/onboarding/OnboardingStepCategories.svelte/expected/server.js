import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import SettingsCategories from '../settings/SettingsCategories.svelte';

export default function OnboardingStepCategories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { categories = [] } = $$props;

		$$renderer.push(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${$.escape(s("onboarding.categories.title") || "Choose Your Topics")}</h2> <p class="text-gray-600 dark:text-gray-300 mb-2">${$.escape(s("onboarding.categories.subtitle") || "Kagi News follows news from around the world, covering national, regional, and local events. Select the categories you're interested in:")}</p></div> `);
		SettingsCategories($$renderer, { categories });
		$$renderer.push(`<!----></div>`);
	});
}