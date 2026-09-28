import * as $ from 'svelte/internal/server';
import { IconArrowUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { displaySettings } from '$lib/data/settings.svelte.js';
import { toastStore } from '$lib/stores/toast.svelte';

export default function BackToTop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const hasToasts = $.derived(() => toastStore.toasts.length > 0);
		let visible = false;
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
					visible = scrollProgress > 0.8;
				} else {
					visible = scrollY > 500;
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
					visible = false;
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

		if (displaySettings.categoryHeaderPosition === "bottom") {
			$$renderer.push(`<!--[0--><button${$.attr_class("fixed end-8 size-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 max-md:end-6 max-md:size-11 " + (visible ? "opacity-100 visible" : "opacity-0 invisible") + " " + (hasToasts()
				? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(8.5rem+env(safe-area-inset-bottom))]"
				: "bottom-[calc(2rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))]"))}${$.attr('aria-label', s("navigation.backToTop"))}${$.attr('title', s("navigation.backToTop"))}>`);

			IconArrowUp($$renderer, { class: 'size-6 text-gray-700 dark:text-gray-300' });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attr_class("fixed end-8 size-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 max-md:end-6 max-md:size-11 " + (visible ? "opacity-100 visible" : "opacity-0 invisible") + " " + (hasToasts()
				? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))]"
				: "bottom-[calc(2rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"))}${$.attr('aria-label', s("navigation.backToTop"))}${$.attr('title', s("navigation.backToTop"))}>`);

			IconArrowUp($$renderer, { class: 'size-6 text-gray-700 dark:text-gray-300' });
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}