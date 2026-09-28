import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { isRtlLocale } from '$lib/client/rtl-detection';
import { languageSettings } from '$lib/data/settings.svelte';
import { batchService } from '$lib/services/batchService';
import { fetchWikipediaContent } from '$lib/services/wikipediaService';

var root = $.from_html(`<div class="absolute top-0 right-0 h-full w-[1px] bg-[var(--color-header)]"></div>`);
var root_1 = $.from_html(`<div class="relative flex w-1/3 flex-col items-center px-4 text-center"><!> <span class="mr-auto mb-2 text-2xl font-bold text-[var(--color-header)]"> </span> <div class="flex items-start gap-4"><img class="h-10 w-10 flex-shrink-0 rounded-full object-cover" alt="placeholder"/> <span class="text-left text-sm text-gray-700 dark:text-gray-300" dir="auto"></span></div></div>`);
var root_2 = $.from_html(`<div class="flex w-full shrink-0 justify-around"></div>`);
var root_3 = $.from_html(`<button></button>`);
var root_4 = $.from_html(`<div class="mt-4 flex justify-center space-x-2"></div>`);
var root_5 = $.from_html(`<div class="mb-4 flex items-start gap-4"><span class="text-2xl font-bold text-[var(--color-header)]"> </span> <span class="text-sm text-gray-700 dark:text-gray-300" dir="auto"></span></div>`);
var root_6 = $.from_html(`<div><h3 class="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-300"> </h3> <div class="relative hidden md:block"><button class="absolute top-1/2 start-[-2rem] -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 focus-visible-ring dark:text-gray-500 dark:hover:text-gray-300" aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button> <div class="overflow-hidden"><div class="flex transition-transform duration-200 ease-out"></div></div> <button class="absolute top-1/2 end-[-2rem] -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 focus-visible-ring dark:text-gray-500 dark:hover:text-gray-300" aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button> <!></div> <div class="block md:hidden"></div></div>`);

export default function OnThisDayPeopleCarousel($$anchor, $$props) {
	$.push($$props, true);

	// People images cache (for carousel)
	let peopleImagesCache = new Map();

	let imagesLoaded = $.state(0 // Counter to trigger reactivity when images load
	);

	// People carousel state
	let currentSlide = $.state(0);

	const itemsPerSlide = 3;

	const chunkedPeople = $.derived(() => $$props.people.reduce(
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

	const carouselTransform = $.derived(() => $.get(isRtl)
		? `translateX(${$.get(currentSlide) * 100}%)`
		: `translateX(-${$.get(currentSlide) * 100}%)`);

	// Preload Wikipedia thumbnails for people (for carousel images)
	async function preloadPeopleImages() {
		if ($$props.people.length === 0) return;

		// Skip preloading in time travel mode
		if (batchService.isTimeTravelMode()) return;

		console.log('Starting to preload images for', $$props.people.length, 'people');

		const imagePromises = $$props.people.map(async (person, index) => {
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
					$.update(imagesLoaded // Trigger reactivity
					);
				} else {
					console.warn(`❌ No thumbnail for ${person.year} (${wikiId})`);
				}
			} catch(error) {
				console.error(`Failed to preload image for person ${person.year}:`, error);
			}
		});

		await Promise.allSettled(imagePromises);
		console.log('Finished preloading people images. Total loaded:', $.get(imagesLoaded));
	}

	// Get cached image for a person (reactive to imagesLoaded)
	function getPersonImage(person) {
		// Reference imagesLoaded to trigger reactivity when images load
		void $.get(imagesLoaded);

		const cacheKey = person.year + person.content;
		const cached = peopleImagesCache.get(cacheKey);

		console.log(`Getting image for ${person.year}:`, cached ? 'FOUND' : 'NOT FOUND', cached);

		return cached || '/svg/placeholder.svg';
	}

	// Carousel functions
	function nextSlide() {
		if ($.get(currentSlide) < $.get(chunkedPeople).length - 1) {
			$.update(currentSlide);
		}
	}

	function prevSlide() {
		if ($.get(currentSlide) > 0) {
			$.update(currentSlide, -1);
		}
	}

	function goToSlide(index) {
		$.set(currentSlide, index, true);
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

	// Reactively preload people images when people array changes
	$.user_effect(() => {
		if (browser && $$props.people.length > 0) {
			console.log('People data loaded, starting image preload for', $$props.people.length, 'people');
			preloadPeopleImages();
		}
	});

	var div = root_6();
	var h3 = $.child(div);
	var text = $.only_child(h3, true);
	var div_1 = $.sibling(h3, 2);
	var button = $.child(div_1);
	var div_2 = $.sibling(button, 2);
	var div_3 = $.child(div_2);

	$.each(div_3, 21, () => $.get(chunkedPeople), $.index, ($$anchor, slide) => {
		var div_4 = root_2();

		$.each(div_4, 21, () => $.get(slide), $.index, ($$anchor, person, index) => {
			var div_5 = root_1();
			var node = $.child(div_5);

			{
				var consequent = ($$anchor) => {
					var div_6 = root();

					$.append($$anchor, div_6);
				};

				$.if(node, ($$render) => {
					if (index < $.get(slide).length - 1) $$render(consequent);
				});
			}

			var span = $.sibling(node, 2);
			var text_1 = $.only_child(span, true);
			var div_7 = $.sibling(span, 2);
			var img = $.child(div_7);
			var span_1 = $.sibling(img, 2);

			$.html(span_1, () => $.get(person).content.replace(/href=/g, 'class="underline text-gray-800 hover:text-gray-600 cursor-pointer transition-colors dark:text-gray-200 dark:hover:text-gray-400" href='), true);
			$.reset(span_1);
			$.reset(div_7);
			$.reset(div_5);

			$.template_effect(
				($0) => {
					$.set_text(text_1, $.get(person).year);
					$.set_attribute(img, 'src', $0);
					span_1.dir = span_1.dir;
				},
				[() => getPersonImage($.get(person))]
			);

			$.append($$anchor, div_5);
		});

		$.reset(div_4);
		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_2);

	var button_1 = $.sibling(div_2, 2);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_8 = root_4();

			$.each(div_8, 21, () => $.get(chunkedPeople), $.index, ($$anchor, _, i) => {
				var button_2 = root_3();

				$.set_attribute(button_2, 'aria-label', `Go to slide ${i + 1}`);

				$.template_effect(() => $.set_class(button_2, 1, `h-2 w-2 rounded-full transition-colors focus-visible-ring ${$.get(currentSlide) === i
					? 'bg-gray-600 dark:bg-gray-400'
					: 'bg-gray-300 dark:bg-gray-600'}`));

				$.delegated('click', button_2, () => goToSlide(i));
				$.delegated('keydown', button_2, (e) => handleDotKeydown(e, i));
				$.append($$anchor, button_2);
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_1, ($$render) => {
			if ($.get(chunkedPeople).length > 1) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var div_9 = $.sibling(div_1, 2);

	$.each(div_9, 21, () => $$props.people, $.index, ($$anchor, person) => {
		var div_10 = root_5();
		var span_2 = $.child(div_10);
		var text_2 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 2);

		$.html(span_3, () => $.get(person).content.replace(/href=/g, 'class="underline text-gray-800 hover:text-gray-600 cursor-pointer transition-colors dark:text-gray-200 dark:hover:text-gray-400" href='), true);
		$.reset(span_3);
		$.reset(div_10);

		$.template_effect(() => {
			$.set_text(text_2, $.get(person).year);
			span_3.dir = span_3.dir;
		});

		$.append($$anchor, div_10);
	});

	$.reset(div_9);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			button.disabled = $.get(currentSlide) === 0;
			$.set_style(div_3, `transform: ${$.get(carouselTransform) ?? ''}`);
			button_1.disabled = $.get(currentSlide) === $.get(chunkedPeople).length - 1;
		},
		[() => s("onthisday.people") || "People"]
	);

	$.delegated('click', button, prevSlide);
	$.event('wheel', div_2, handleWheel);
	$.delegated('click', button_1, nextSlide);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);