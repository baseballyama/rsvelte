import * as $ from 'svelte/internal/server';
import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { displaySettings } from '$lib/data/settings.svelte.js';
import { scrollLock } from '$lib/utils/scrollLock.js';
import OnboardingStepAppearance from './onboarding/OnboardingStepAppearance.svelte';
import OnboardingStepCategories from './onboarding/OnboardingStepCategories.svelte';
import OnboardingStepSections from './onboarding/OnboardingStepSections.svelte';
import 'overlayscrollbars/overlayscrollbars.css';
import { fade, slide } from 'svelte/transition';

export default function OnboardingModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { visible = false, categories = [], onComplete } = $$props;

		// State
		let currentStep = 1;

		const totalSteps = 3;

		// OverlayScrollbars setup
		let scrollableElement = undefined;

		let [initialize, instance] = useOverlayScrollbars({
			defer: true,
			options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
		});

		// Navigation
		function nextStep() {
			if (currentStep < totalSteps) {
				currentStep++;

				// Reset scroll to top when changing steps
				const inst = instance();

				if (inst) {
					inst.elements().viewport.scrollTop = 0;
				}
			} else {
				finishOnboarding();
			}
		}

		function previousStep() {
			if (currentStep > 1) {
				currentStep--;

				// Reset scroll to top when changing steps
				const inst = instance();

				if (inst) {
					inst.elements().viewport.scrollTop = 0;
				}
			}
		}

		function finishOnboarding() {
			// Mark onboarding as completed
			if (browser) {
				localStorage.setItem('kite-onboarding-completed', 'true');
			}

			// Mark intro as shown
			displaySettings.showIntro = false;

			if (onComplete) {
				onComplete();
			}
		}

		function skipOnboarding() {
			// Just mark as completed without applying any changes
			if (browser) {
				localStorage.setItem('kite-onboarding-completed', 'true');
			}

			displaySettings.showIntro = false;

			if (onComplete) {
				onComplete();
			}
		}

		// Handle escape key
		function handleKeydown(e) {
			if (e.key === 'Escape' && visible) {
				skipOnboarding();
			}
		}

		if (// Handle visibility changes and scroll lock
		// Lock background scroll
		// Add keyboard listener
		// Initialize OverlayScrollbars
		visible) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 z-modal overflow-y-auto bg-black/30"><div class="flex min-h-full items-center justify-center p-4"><div class="w-full max-w-2xl shadow-2xl"><div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-t-2xl"><div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-200 rounded-t-2xl"${$.attr_style(`width: ${$.stringify(currentStep / totalSteps * 100)}%`)}></div></div> <div class="bg-white dark:bg-gray-800 rounded-b-2xl overflow-hidden"><div class="max-h-[600px] overflow-hidden" data-overlayscrollbars-initialize=""><div class="p-8">`);

			if (currentStep === 1) {
				$$renderer.push('<!--[0-->');
				OnboardingStepAppearance($$renderer, {});
			} else if (currentStep === 2) {
				$$renderer.push('<!--[1-->');
				OnboardingStepCategories($$renderer, { categories });
			} else if (currentStep === 3) {
				$$renderer.push('<!--[2-->');
				OnboardingStepSections($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="px-8 pb-8"><div class="flex justify-between mt-4"><div class="flex items-center gap-4">`);

			if (currentStep === 1) {
				$$renderer.push(`<!--[0--><button class="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">${$.escape(s("onboarding.button.skip") || "Skip")}</button>`);
			} else {
				$$renderer.push(`<!--[-1--><button class="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">${$.escape(s("onboarding.button.back") || "← Back")}</button>`);
			}

			$$renderer.push(`<!--]--></div> <button class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer">${$.escape(currentStep === totalSteps
				? s("onboarding.button.getStarted") || "Get Started"
				: s("onboarding.button.next") || "Next →")}</button></div></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}