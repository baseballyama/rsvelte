import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

import {
	getImageSrc,
	getProxiedImageUrl,
	isImageCached,
	onCacheUpdate
} from '$lib/utils/imagePreloader';

import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg" role="status" aria-live="polite" aria-label="Loading image"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" aria-hidden="true"></div></div>`);
var root_1 = $.from_html(`<div class="bg-opacity-50 hover:bg-opacity-75 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-sm text-white"> </div>`);
var root_2 = $.from_html(`<p class="mt-2 text-sm text-gray-600 italic dark:text-gray-400"><!></p>`);
var root_3 = $.from_html(`<section class="mt-6"><figure><div class="relative"><div class="relative mx-auto w-[calc(100%-1rem)] max-w-[800px]"><a target="_blank" rel="noopener noreferrer"><img/> <!> <!></a> <!></div></div></figure></section>`);

export default function StoryImage($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let imagesPreloaded = $.prop($$props, 'imagesPreloaded', 3, false),
		showCaption = $.prop($$props, 'showCaption', 3, false),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// State for image loading
	let imageLoaded = $.state(false);

	let imageError = $.state(false);
	let currentImageSrc = $.state('');
	let cacheVersion = $.state(0 // Force reactivity
	);

	// Get the image source reactively
	const imageSrc = $.derived(() => () => {
		void $.get(cacheVersion // Subscribe to cache changes
		);

		return getImageSrc($$props.article.image);
	});

	// Update currentImageSrc when imageSrc changes
	$.user_effect(() => {
		const newSrc = $.get(imageSrc)();

		if (newSrc !== $.get(currentImageSrc)) {
			$.set(currentImageSrc, newSrc, true);
			$.set(imageLoaded, false);
			$.set(imageError, false);
		}
	});

	// Determine loading strategy
	const shouldLoadEagerly = $.derived(() => imagesPreloaded() || $$props.article.image && isImageCached($$props.article.image));

	// Handle image load
	function handleImageLoad() {
		$.set(imageLoaded, true);
		$.set(imageError, false);
	}

	// Handle image error
	function handleImageError() {
		$.set(imageError, true);
		$.set(imageLoaded, false);

		// If we're using a cached version and it failed, try the proxied URL
		if ($.get(currentImageSrc)?.startsWith('data:')) {
			const proxiedUrl = getProxiedImageUrl($$props.article.image);

			console.warn('Cached image failed, falling back to proxied URL:', proxiedUrl);
			$.set(currentImageSrc, proxiedUrl, true);
			$.set(imageError, false // Reset error state to try loading again
			);
		} else {
			console.error('Image failed to load even with proxy:', $.get(currentImageSrc));
		}
	}

	// Subscribe to cache updates
	onMount(() => {
		if (!$$props.article.image) return;

		// Subscribe to cache updates
		const unsubscribe = onCacheUpdate(() => {
			$.update(cacheVersion // Trigger reactivity
			);
		});

		return unsubscribe;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var section = root_3();
			var figure = $.child(section);
			var div = $.child(figure);
			var div_1 = $.child(div);
			var a = $.child(div_1);
			let classes;
			var img = $.child(a);
			let classes_1;
			var node_1 = $.sibling(img, 2);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();

					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (!$.get(imageLoaded)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_3 = root_1();
					var text = $.only_child(div_3, true);

					$.template_effect(() => $.set_text(text, $$props.article.domain));
					$.append($$anchor, div_3);
				};

				$.if(node_2, ($$render) => {
					if (showCaption() && $$props.article.domain && $.get(imageLoaded) && !$.get(imageError)) $$render(consequent_1);
				});
			}

			$.reset(a);

			var node_3 = $.sibling(a, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p = root_2();
					var node_4 = $.child(p);

					{
						var consequent_2 = ($$anchor) => {
							SelectableText($$anchor, {
								get text() {
									return $$props.article.image_caption;
								},

								get flashcardMode() {
									return flashcardMode();
								},

								get selectedWords() {
									return selectedWords();
								},

								get shouldJiggle() {
									return shouldJiggle();
								},

								get onWordClick() {
									return $$props.onWordClick;
								},
								section: 'image_caption'
							});
						};

						var alternate = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $$props.article.image_caption));
							$.append($$anchor, text_1);
						};

						$.if(node_4, ($$render) => {
							if (flashcardMode()) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.reset(p);
					$.append($$anchor, p);
				};

				$.if(node_3, ($$render) => {
					if (showCaption() && $$props.article.image_caption && $.get(imageLoaded) && !$.get(imageError)) $$render(consequent_3);
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.reset(figure);
			$.reset(section);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $$props.article.link || "#");

					$.set_attribute(a, 'aria-label', $$props.article.link
						? `View full article: ${$$props.article.image_caption || 'Story image'} at ${$$props.article.domain || 'source'}`
						: undefined);

					classes = $.set_class(a, 1, 'relative block', null, classes, { 'pointer-events-none': !$$props.article.link });
					$.set_attribute(img, 'src', $0);
					$.set_attribute(img, 'alt', $$props.article.image_caption || "Story image");
					classes_1 = $.set_class(img, 1, 'h-auto w-full rounded-lg shadow-md', null, classes_1, { 'opacity-50': !$.get(imageLoaded) && !$.get(imageError) });
					$.set_attribute(img, 'loading', $.get(shouldLoadEagerly) ? "eager" : "lazy");
					$.set_attribute(img, 'decoding', $.get(shouldLoadEagerly) ? "sync" : "async");
				},
				[
					() => $.get(currentImageSrc) || getProxiedImageUrl($$props.article.image)
				]
			);

			$.event('load', img, handleImageLoad);
			$.event('error', img, handleImageError);
			$.replay_events(img);
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if (!$.get(imageError)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}