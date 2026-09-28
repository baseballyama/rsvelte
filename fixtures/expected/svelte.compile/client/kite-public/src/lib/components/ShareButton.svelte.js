import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip, offset, shift, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { IconCheck, IconLoader2, IconShare } from '@tabler/icons-svelte';
import { onDestroy, onMount } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<div><!> <span> </span></div>`);
var root_1 = $.from_html(`<button><!></button> <!>`, 1);

export default function ShareButton($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 19, () => s('article.shareDefaultTitle') || 'Check out this story'),
		description = $.prop($$props, 'description', 3, ''),
		className = $.prop($$props, 'class', 3, '');

	let showCopiedFeedback = $.state(false);
	let isLoading = $.state(false);
	let feedbackTimer;

	// Floating UI setup for the "Copied!" tooltip
	const floating = useFloating({
		placement: 'left',
		strategy: 'fixed',
		middleware: [
			offset(8), // 8px gap from button
			flip({ fallbackPlacements: ['right', 'top', 'bottom'] }), // Flip if no space
			shift({ padding: 8 }) // Keep within viewport
		]
	});

	// Hide tooltip on scroll
	function hideTooltipOnScroll() {
		if ($.get(showCopiedFeedback)) {
			$.set(showCopiedFeedback, false);

			if (feedbackTimer) {
				clearTimeout(feedbackTimer);
				feedbackTimer = undefined;
			}
		}
	}

	// Setup scroll listener
	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', hideTooltipOnScroll, { passive: true });
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', hideTooltipOnScroll);
		}

		if (feedbackTimer) {
			clearTimeout(feedbackTimer);
		}
	});

	async function handleShare() {
		if (!browser || $.get(isLoading) || $.get(showCopiedFeedback)) return;

		$.set(isLoading, true);

		try {
			// Build the payload for the shorten API - server builds the URL and calculates sequence
			const shortenPayload = {
				batchId: $$props.batchId,
				categoryId: $$props.categoryId,
				clusterId: $$props.clusterId ?? undefined,
				storyIndex: $$props.storyIndex ?? undefined,
				title: title() ?? undefined,
				languageCode: $$props.languageCode ?? undefined
			};

			// Check if mobile and Web Share API is available
			const isMobile = (/mobile|android|iphone|ipad/i).test(navigator.userAgent);

			if (isMobile && navigator.share) {
				// For mobile Web Share API, fetch the short URL first
				let finalShareUrl = '';

				try {
					const response = await fetch('/api/shorten', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(shortenPayload)
					});

					if (response.ok) {
						const { shortUrl } = await response.json();

						finalShareUrl = shortUrl;
					}
				} catch(err) {
					console.error('Failed to create share URL:', err);
					$.set(isLoading, false);

					return;
				}

				$.set(isLoading, false);

				try {
					// Format the shared text nicely
					const shareTitle = `${title()} - Kagi News`;

					const shareText = description()
						? `${description()}\n\nRead more on Kagi:`
						: `${title()}\n\nRead more on Kagi:`;

					await navigator.share({ title: shareTitle, text: shareText, url: finalShareUrl });

					// Don't show floating tooltip on mobile - native share is enough
					return;
				} catch(err) {
					// User cancelled or error occurred
					if (err instanceof Error && err.name !== 'AbortError') {
						console.error('Error sharing:', err);
					}

					// Fall through to clipboard copy if share fails
				}
			}

			// Desktop: Copy to clipboard with Safari-compatible approach
			// Safari requires clipboard operation to start synchronously in user gesture
			let copySuccess = false;

			if (navigator.clipboard && window.isSecureContext) {
				try {
					// Create a Promise that fetches the short URL from the API
					// Pass structured data (not a full URL) to the backend
					const urlPromise = fetch('/api/shorten', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(shortenPayload)
					}).then((response) => {
						if (!response.ok) throw new Error('Failed to create short URL');

						return response.json();
					}).then((data) => {
						if (!data.shortUrl) throw new Error('No short URL returned');

						return data.shortUrl;
					}).catch((err) => {
						console.error('Failed to create share URL:', err);

						throw err;
					});

					// Use ClipboardItem to pass the Promise directly to clipboard API
					// This preserves user gesture context in Safari
					const item = new ClipboardItem({
						'text/plain': urlPromise.then((url) => new Blob([url], { type: 'text/plain' }))
					});

					await navigator.clipboard.write([item]);
					copySuccess = true;
				} catch(err) {
					console.warn('ClipboardItem API failed:', err);
				}
			}

			// Fallback: Fetch URL synchronously and copy with execCommand
			if (!copySuccess) {
				try {
					const response = await fetch('/api/shorten', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(shortenPayload)
					});

					if (response.ok) {
						const { shortUrl } = await response.json();
						const textArea = document.createElement('textarea');

						textArea.value = shortUrl;
						textArea.style.position = 'fixed';
						textArea.style.top = '0';
						textArea.style.left = '-999999px';
						textArea.setAttribute('readonly', '');
						document.body.appendChild(textArea);
						textArea.select();
						textArea.setSelectionRange(0, shortUrl.length);
						copySuccess = document.execCommand('copy');
						document.body.removeChild(textArea);
					}
				} catch(execErr) {
					console.error('All clipboard methods failed:', execErr);
				}
			}

			$.set(isLoading, false);

			if (copySuccess) {
				// Show feedback
				$.set(showCopiedFeedback, true);

				// Clear any existing timer
				if (feedbackTimer) clearTimeout(feedbackTimer);

				// Hide feedback after 2 seconds
				feedbackTimer = setTimeout(
					() => {
						$.set(showCopiedFeedback, false);
					},
					2000
				);
			}
		} catch(error) {
			console.error('Share failed:', error);
			$.set(isLoading, false);
		}
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			IconLoader2($$anchor, {
				size: 20,
				stroke: 2,
				class: 'animate-spin text-gray-500 dark:text-gray-400'
			});
		};

		var alternate = ($$anchor) => {
			IconShare($$anchor, {
				size: 20,
				stroke: 2,
				class: 'transition-colors text-gray-600 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
			});
		};

		$.if(node, ($$render) => {
			if ($.get(isLoading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.bind_this(button, ($$value) => floating.elements.reference = $$value, () => floating?.elements?.reference);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_2 = $.child(div);

					IconCheck(node_2, { size: 16, stroke: 2.5, class: 'text-white' });

					var span = $.sibling(node_2, 2);
					var text = $.only_child(span, true);

					$.reset(div);
					$.bind_this(div, ($$value) => floating.elements.floating = $$value, () => floating?.elements?.floating);

					$.template_effect(
						($0) => {
							$.set_class(div, 1, `absolute top-0 left-0 z-tooltip flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-200 dark:bg-green-700 ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`);
							$.set_style(div, floating.floatingStyles);
							$.set_text(text, $0);
						},
						[() => s("article.shareCopied") || "Copied!"]
					);

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(showCopiedFeedback)) $$render(consequent_1);
		});
	}

	$.template_effect(
		($0, $1) => {
			$.set_class(button, 1, `group relative flex h-10 w-10 items-center justify-center rounded-lg ${className() ?? ''}`, 'svelte-9nlw8n');
			$.set_attribute(button, 'aria-label', $0);
			$.set_attribute(button, 'title', $1);
			button.disabled = $.get(isLoading);
		},
		[
			() => s("article.shareStory") || "Share story",
			() => s("article.shareStory") || "Share story"
		]
	);

	$.delegated('click', button, handleShare);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);