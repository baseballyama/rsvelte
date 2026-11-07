import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconArrowUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { displaySettings } from '$lib/data/settings.svelte.js';
import { toastStore } from '$lib/stores/toast.svelte';

var root = $.from_html(`<button><!></button>`);

export default function BackToTop($$anchor, $$props) {
	$.push($$props, true);

	const hasToasts = $.derived(() => toastStore.toasts.length > 0);
	let visible = $.state(false);
	let isScrolling = false;
	let scrollStartTime = 0;
	let scrollStartPosition = 0;
	let animationFrame = null;

	function handleScroll() {
		if (!isScrolling) {
			const scrollY = window.scrollY;
			const scrollHeight = document.documentElement.scrollHeight;
			const clientHeight = window.innerHeight;
			const scrollProgress = scrollY / (scrollHeight - clientHeight);

			// On mobile (window width < 768px), only show when near the end (80% scrolled)
			// On desktop, show after 500px
			const isMobile = window.innerWidth < 768;

			if (isMobile) {
				$.set(visible, scrollProgress > 0.8);
			} else {
				$.set(visible, scrollY > 500);
			}
		}
	}

	function easeInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
	}

	function scrollToTop() {
		isScrolling = true;
		scrollStartTime = performance.now();
		scrollStartPosition = window.scrollY;

		const duration = 300; // 300ms for faster scrolling

		function animateScroll(currentTime) {
			const elapsed = currentTime - scrollStartTime;
			const progress = Math.min(elapsed / duration, 1);
			const easeProgress = easeInOutCubic(progress);

			window.scrollTo(0, scrollStartPosition * (1 - easeProgress));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animateScroll);
			} else {
				isScrolling = false;
				$.set(visible, false);
				animationFrame = null;
			}
		}

		animationFrame = requestAnimationFrame(animateScroll);
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var node_1 = $.child(button);

			IconArrowUp(node_1, { class: 'size-6 text-gray-700 dark:text-gray-300' });
			$.reset(button);

			$.template_effect(
				($0, $1) => {
					$.set_class(button, 1, "fixed end-8 size-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 max-md:end-6 max-md:size-11 " + ($.get(visible) ? "opacity-100 visible" : "opacity-0 invisible") + " " + ($.get(hasToasts)
						? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(8.5rem+env(safe-area-inset-bottom))]"
						: "bottom-[calc(2rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))]"));

					$.set_attribute(button, 'aria-label', $0);
					$.set_attribute(button, 'title', $1);
				},
				[
					() => s("navigation.backToTop"),
					() => s("navigation.backToTop")
				]
			);

			$.delegated('click', button, scrollToTop);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var button_1 = root();
			var node_2 = $.child(button_1);

			IconArrowUp(node_2, { class: 'size-6 text-gray-700 dark:text-gray-300' });
			$.reset(button_1);

			$.template_effect(
				($0, $1) => {
					$.set_class(button_1, 1, "fixed end-8 size-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 max-md:end-6 max-md:size-11 " + ($.get(visible) ? "opacity-100 visible" : "opacity-0 invisible") + " " + ($.get(hasToasts)
						? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))]"
						: "bottom-[calc(2rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"));

					$.set_attribute(button_1, 'aria-label', $0);
					$.set_attribute(button_1, 'title', $1);
				},
				[
					() => s("navigation.backToTop"),
					() => s("navigation.backToTop")
				]
			);

			$.delegated('click', button_1, scrollToTop);
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if (displaySettings.categoryHeaderPosition === "bottom") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);