import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<button class="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"> </button>`);
var root_1 = $.from_html(`<button class="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"> </button>`);
var root_2 = $.from_html(`<div class="fixed inset-0 z-modal overflow-y-auto bg-black/30"><div class="flex min-h-full items-center justify-center p-4"><div class="w-full max-w-2xl shadow-2xl"><div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-t-2xl"><div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-200 rounded-t-2xl"></div></div> <div class="bg-white dark:bg-gray-800 rounded-b-2xl overflow-hidden"><div class="max-h-[600px] overflow-hidden" data-overlayscrollbars-initialize=""><div class="p-8"><!></div></div> <div class="px-8 pb-8"><div class="flex justify-between mt-4"><div class="flex items-center gap-4"><!></div> <button class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"> </button></div></div></div></div></div></div>`);

export default function OnboardingModal($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let visible = $.prop($$props, 'visible', 3, false),
		categories = $.prop($$props, 'categories', 19, () => []);

	// State
	let currentStep = $.state(1);

	const totalSteps = 3;

	// OverlayScrollbars setup
	let scrollableElement = $.state(undefined);

	let [initialize, instance] = useOverlayScrollbars({
		defer: true,
		options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
	});

	// Navigation
	function nextStep() {
		if ($.get(currentStep) < totalSteps) {
			$.update(currentStep);

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
		if ($.get(currentStep) > 1) {
			$.update(currentStep, -1);

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

		if ($$props.onComplete) {
			$$props.onComplete();
		}
	}

	function skipOnboarding() {
		// Just mark as completed without applying any changes
		if (browser) {
			localStorage.setItem('kite-onboarding-completed', 'true');
		}

		displaySettings.showIntro = false;

		if ($$props.onComplete) {
			$$props.onComplete();
		}
	}

	// Handle escape key
	function handleKeydown(e) {
		if (e.key === 'Escape' && visible()) {
			skipOnboarding();
		}
	}

	// Handle visibility changes and scroll lock
	$.user_effect(() => {
		if (!browser) return;

		if (visible()) {
			// Lock background scroll
			scrollLock.lock();

			// Add keyboard listener
			document.addEventListener('keydown', handleKeydown);

			return () => {
				document.removeEventListener('keydown', handleKeydown);
				scrollLock.unlock();
			};
		}
	});

	// Initialize OverlayScrollbars
	$.user_effect(() => {
		if ($.get(scrollableElement)) {
			initialize($.get(scrollableElement));
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var div_4 = $.only_child(div_3);
			var div_5 = $.sibling(div_3, 2);
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_1 = $.child(div_7);

			{
				var consequent = ($$anchor) => {
					OnboardingStepAppearance($$anchor, {});
				};

				var consequent_1 = ($$anchor) => {
					OnboardingStepCategories($$anchor, {
						get categories() {
							return categories();
						}
					});
				};

				var consequent_2 = ($$anchor) => {
					OnboardingStepSections($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(currentStep) === 1) $$render(consequent); else if ($.get(currentStep) === 2) $$render(consequent_1, 1); else if ($.get(currentStep) === 3) $$render(consequent_2, 2);
				});
			}

			$.reset(div_7);
			$.reset(div_6);
			$.bind_this(div_6, ($$value) => $.set(scrollableElement, $$value), () => $.get(scrollableElement));

			var div_8 = $.sibling(div_6, 2);
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var node_2 = $.child(div_10);

			{
				var consequent_3 = ($$anchor) => {
					var button = root();
					var text = $.only_child(button, true);

					$.template_effect(($0) => $.set_text(text, $0), [() => s("onboarding.button.skip") || "Skip"]);
					$.delegated('click', button, skipOnboarding);
					$.append($$anchor, button);
				};

				var alternate = ($$anchor) => {
					var button_1 = root_1();
					var text_1 = $.only_child(button_1, true);

					$.template_effect(($0) => $.set_text(text_1, $0), [() => s("onboarding.button.back") || "← Back"]);
					$.delegated('click', button_1, previousStep);
					$.append($$anchor, button_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(currentStep) === 1) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.reset(div_10);

			var button_2 = $.sibling(div_10, 2);
			var text_2 = $.only_child(button_2, true);

			$.reset(div_9);
			$.reset(div_8);
			$.reset(div_5);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_style(div_4, `width: ${$.get(currentStep) / totalSteps * 100}%`);
					$.set_text(text_2, $0);
				},
				[
					() => $.get(currentStep) === totalSteps
						? s("onboarding.button.getStarted") || "Get Started"
						: s("onboarding.button.next") || "Next →"
				]
			);

			$.delegated('click', button_2, nextStep);
			$.transition(3, div_2, () => slide, () => ({ duration: 200 }));
			$.transition(3, div, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (visible()) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);