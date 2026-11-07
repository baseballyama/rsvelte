import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

import {
	getImageSrc,
	getProxiedImageUrl,
	isImageCached,
	onCacheUpdate
} from '$lib/utils/imagePreloader';

import SelectableText from './SelectableText.svelte';

export default function StoryImage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			article,
			imagesPreloaded = false,
			showCaption = false,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// State for image loading
		let imageLoaded = false;

		let imageError = false;
		let currentImageSrc = '';
		let cacheVersion = 0; // Force reactivity

		// Get the image source reactively
		const imageSrc = $.derived(() => () => {
			void cacheVersion; // Subscribe to cache changes

			return getImageSrc(article.image);
		});

		// Update currentImageSrc when imageSrc changes
		// Determine loading strategy
		const shouldLoadEagerly = $.derived(() => imagesPreloaded || article.image && isImageCached(article.image));

		// Handle image load
		function handleImageLoad() {
			imageLoaded = true;
			imageError = false;
		}

		// Handle image error
		function handleImageError() {
			imageError = true;
			imageLoaded = false;

			// If we're using a cached version and it failed, try the proxied URL
			if (currentImageSrc?.startsWith('data:')) {
				const proxiedUrl = getProxiedImageUrl(article.image);

				console.warn('Cached image failed, falling back to proxied URL:', proxiedUrl);
				currentImageSrc = proxiedUrl;
				imageError = false; // Reset error state to try loading again
			} else {
				console.error('Image failed to load even with proxy:', currentImageSrc);
			}
		}

		// Subscribe to cache updates
		onMount(() => {
			if (!article.image) return;

			// Subscribe to cache updates
			const unsubscribe = onCacheUpdate(() => {
				cacheVersion++; // Trigger reactivity
			});

			return unsubscribe;
		});

		if (!imageError) {
			$$renderer.push(`<!--[0--><section class="mt-6"><figure><div class="relative"><div class="relative mx-auto w-[calc(100%-1rem)] max-w-[800px]"><a${$.attr('href', article.link || "#")} target="_blank" rel="noopener noreferrer"${$.attr('aria-label', article.link
				? `View full article: ${article.image_caption || 'Story image'} at ${article.domain || 'source'}`
				: undefined)}${$.attr_class('relative block', void 0, { 'pointer-events-none': !article.link })}><img${$.attr('src', currentImageSrc || getProxiedImageUrl(article.image))}${$.attr('alt', article.image_caption || "Story image")}${$.attr_class('h-auto w-full rounded-lg shadow-md', void 0, { 'opacity-50': !imageLoaded && !imageError })}${$.attr('loading', shouldLoadEagerly() ? "eager" : "lazy")}${$.attr('decoding', shouldLoadEagerly() ? "sync" : "async")} onload="this.__e=event" onerror="this.__e=event"/> `);

			if (!imageLoaded) {
				$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg" role="status" aria-live="polite" aria-label="Loading image"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" aria-hidden="true"></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showCaption && article.domain && imageLoaded && !imageError) {
				$$renderer.push(`<!--[0--><div class="bg-opacity-50 hover:bg-opacity-75 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-sm text-white">${$.escape(article.domain)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a> `);

			if (showCaption && article.image_caption && imageLoaded && !imageError) {
				$$renderer.push(`<!--[0--><p class="mt-2 text-sm text-gray-600 italic dark:text-gray-400">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: article.image_caption,
						flashcardMode,
						selectedWords,
						shouldJiggle,
						onWordClick,
						section: 'image_caption'
					});
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(article.image_caption)}`);
				}

				$$renderer.push(`<!--]--></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></figure></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}