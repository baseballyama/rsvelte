import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { isRtlLocale } from '$lib/client/rtl-detection';
import { languageSettings } from '$lib/data/settings.svelte';
import { batchService } from '$lib/services/batchService';
import { fetchWikipediaContent } from '$lib/services/wikipediaService';

export default function OnThisDayPeopleCarousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { people } = $$props;

		// People images cache (for carousel)
		let peopleImagesCache = new Map();

		let imagesLoaded = 0; // Counter to trigger reactivity when images load

		// People carousel state
		let currentSlide = 0;

		const itemsPerSlide = 3;

		const chunkedPeople = $.derived(() => people.reduce(
			(chunks, item, index) => {
				const chunkIndex = Math.floor(index / itemsPerSlide);

				if (!chunks[chunkIndex]) chunks[chunkIndex] = [];

				chunks[chunkIndex].push(item);

				return chunks;
			},
			[]
		));

		// Determine if RTL for carousel direction
		const isRtl = $.derived(() => isRtlLocale(languageSettings.ui));

		const carouselTransform = $.derived(() => isRtl()
			? `translateX(${currentSlide * 100}%)`
			: `translateX(-${currentSlide * 100}%)`);

		// Preload Wikipedia thumbnails for people (for carousel images)
		async function preloadPeopleImages() {
			if (people.length === 0) return;

			// Skip preloading in time travel mode
			if (batchService.isTimeTravelMode()) return;

			console.log('Starting to preload images for', people.length, 'people');

			const imagePromises = people.map(async (person, index) => {
				// Extract Wikipedia ID from the person's content
				const linkMatch = person.content.match(/<a[^>]*data-wiki-id="([^"]*)"[^>]*>/);

				if (!linkMatch) {
					console.warn(`No wiki-id found for person ${index}:`, person.content);

					return;
				}

				const wikiId = linkMatch[1];

				try {
					// fetchWikipediaContent now handles Q-IDs properly
					const data = await fetchWikipediaContent(wikiId);

					if (data?.thumbnail?.source) {
						const cacheKey = person.year + person.content;

						peopleImagesCache.set(cacheKey, data.thumbnail.source);
						console.log(`✅ Loaded image for ${person.year}:`, data.thumbnail.source);
						imagesLoaded++; // Trigger reactivity
					} else {
						console.warn(`❌ No thumbnail for ${person.year} (${wikiId})`);
					}
				} catch(error) {
					console.error(`Failed to preload image for person ${person.year}:`, error);
				}
			});

			await Promise.allSettled(imagePromises);
			console.log('Finished preloading people images. Total loaded:', imagesLoaded);
		}

		// Get cached image for a person (reactive to imagesLoaded)
		function getPersonImage(person) {
			// Reference imagesLoaded to trigger reactivity when images load
			void imagesLoaded;

			const cacheKey = person.year + person.content;
			const cached = peopleImagesCache.get(cacheKey);

			console.log(`Getting image for ${person.year}:`, cached ? 'FOUND' : 'NOT FOUND', cached);

			return cached || '/svg/placeholder.svg';
		}

		// Carousel functions
		function nextSlide() {
			if (currentSlide < chunkedPeople().length - 1) {
				currentSlide++;
			}
		}

		function prevSlide() {
			if (currentSlide > 0) {
				currentSlide--;
			}
		}

		function goToSlide(index) {
			currentSlide = index;
		}

		// Handle pagination dot keyboard events
		function handleDotKeydown(event, index) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				goToSlide(index);
			}
		}

		// Wheel navigation
		function handleWheel(event) {
			event.preventDefault();

			if (event.deltaX > 0) {
				nextSlide();
			} else if (event.deltaX < 0) {
				prevSlide();
			}
		}

		$$renderer.push(`<div><h3 class="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-300">${$.escape(
			// Reactively preload people images when people array changes
			s("onthisday.people") || "People"
		)}</h3> <div class="relative hidden md:block"><button class="absolute top-1/2 start-[-2rem] -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 focus-visible-ring dark:text-gray-500 dark:hover:text-gray-300"${$.attr('disabled', currentSlide === 0, true)} aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button> <div class="overflow-hidden"><div class="flex transition-transform duration-200 ease-out"${$.attr_style(`transform: ${carouselTransform()}`)}><!--[-->`);

		const each_array = $.ensure_array_like(chunkedPeople());

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let slide = each_array[$$index_1];

			$$renderer.push(`<div class="flex w-full shrink-0 justify-around"><!--[-->`);

			const each_array_1 = $.ensure_array_like(slide);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let person = each_array_1[index];

				$$renderer.push(`<div class="relative flex w-1/3 flex-col items-center px-4 text-center">`);

				if (index < slide.length - 1) {
					$$renderer.push(`<!--[0--><div class="absolute top-0 right-0 h-full w-[1px] bg-[var(--color-header)]"></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="mr-auto mb-2 text-2xl font-bold text-[var(--color-header)]">${$.escape(person.year)}</span> <div class="flex items-start gap-4"><img class="h-10 w-10 flex-shrink-0 rounded-full object-cover"${$.attr('src', getPersonImage(person))} alt="placeholder"/> <span class="text-left text-sm text-gray-700 dark:text-gray-300" dir="auto">${$.html(person.content.replace(/href=/g, 'class="underline text-gray-800 hover:text-gray-600 cursor-pointer transition-colors dark:text-gray-200 dark:hover:text-gray-400" href='))}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <button class="absolute top-1/2 end-[-2rem] -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 focus-visible-ring dark:text-gray-500 dark:hover:text-gray-300"${$.attr('disabled', currentSlide === chunkedPeople().length - 1, true)} aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button> `);

		if (chunkedPeople().length > 1) {
			$$renderer.push(`<!--[0--><div class="mt-4 flex justify-center space-x-2"><!--[-->`);

			const each_array_2 = $.ensure_array_like(chunkedPeople());

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let _ = each_array_2[i];

				$$renderer.push(`<button${$.attr_class(`h-2 w-2 rounded-full transition-colors focus-visible-ring ${currentSlide === i
					? 'bg-gray-600 dark:bg-gray-400'
					: 'bg-gray-300 dark:bg-gray-600'}`)}${$.attr('aria-label', `Go to slide ${i + 1}`)}></button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="block md:hidden"><!--[-->`);

		const each_array_3 = $.ensure_array_like(people);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let person = each_array_3[$$index_3];

			$$renderer.push(`<div class="mb-4 flex items-start gap-4"><span class="text-2xl font-bold text-[var(--color-header)]">${$.escape(person.year)}</span> <span class="text-sm text-gray-700 dark:text-gray-300" dir="auto">${$.html(person.content.replace(/href=/g, 'class="underline text-gray-800 hover:text-gray-600 cursor-pointer transition-colors dark:text-gray-200 dark:hover:text-gray-400" href='))}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}