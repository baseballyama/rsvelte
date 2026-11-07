import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconBrandGithub, IconExternalLink, IconX } from '@tabler/icons-svelte';
import { fade, scale } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { scrollLock } from '$lib/utils/scrollLock.js';

var root = $.from_html(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 svelte-1up4f39" role="dialog" aria-modal="true" aria-labelledby="clustering-title" tabindex="-1"><div class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-y-auto svelte-1up4f39" role="document"><div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 svelte-1up4f39"><h2 id="clustering-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 svelte-1up4f39"> </h2> <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible-ring svelte-1up4f39"><!></button></div> <div class="p-5 space-y-5 svelte-1up4f39"><div class="flex justify-center svelte-1up4f39" aria-hidden="true"><svg class="clustering-illustration svelte-1up4f39" viewBox="0 0 280 120" width="280" height="120"><circle class="dot dot-cluster-a dot-a1 svelte-1up4f39" cx="30" cy="20" r="6" fill="#3b82f6" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a2 svelte-1up4f39" cx="80" cy="90" r="6" fill="#6366f1" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a3 svelte-1up4f39" cx="50" cy="55" r="6" fill="#8b5cf6" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a4 svelte-1up4f39" cx="15" cy="70" r="5" fill="#a78bfa" opacity="0.6"></circle><circle class="dot dot-cluster-a dot-a5 svelte-1up4f39" cx="75" cy="30" r="5" fill="#818cf8" opacity="0.6"></circle><circle class="dot dot-cluster-b dot-b1 svelte-1up4f39" cx="200" cy="25" r="6" fill="#10b981" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b2 svelte-1up4f39" cx="250" cy="80" r="6" fill="#14b8a6" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b3 svelte-1up4f39" cx="220" cy="65" r="6" fill="#06b6d4" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b4 svelte-1up4f39" cx="265" cy="35" r="5" fill="#34d399" opacity="0.6"></circle><circle class="dot dot-lone dot-l1 svelte-1up4f39" cx="140" cy="30" r="5" fill="#f59e0b" opacity="0.7"></circle><circle class="dot dot-lone dot-l2 svelte-1up4f39" cx="150" cy="100" r="5" fill="#ef4444" opacity="0.7"></circle><circle class="dot dot-lone dot-l3 svelte-1up4f39" cx="125" cy="70" r="4" fill="#f97316" opacity="0.6"></circle><circle class="cluster-ring ring-a svelte-1up4f39" cx="55" cy="55" r="26" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0"></circle><circle class="cluster-ring ring-b svelte-1up4f39" cx="228" cy="52" r="24" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0"></circle><text class="cluster-label label-a svelte-1up4f39" x="55" y="92" text-anchor="middle" font-size="9" fill="#6366f1" opacity="0">story</text><text class="cluster-label label-b svelte-1up4f39" x="228" y="87" text-anchor="middle" font-size="9" fill="#10b981" opacity="0">story</text></svg></div> <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400 svelte-1up4f39"><p class="svelte-1up4f39"> </p> <p class="svelte-1up4f39"> </p> <p class="svelte-1up4f39"> </p> <p class="svelte-1up4f39"> </p></div> <div class="relative svelte-1up4f39"><div class="absolute inset-0 flex items-center svelte-1up4f39"><div class="w-full border-t border-gray-200 dark:border-gray-700 svelte-1up4f39"></div></div> <div class="relative flex justify-center text-xs svelte-1up4f39"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500 svelte-1up4f39"> </span></div></div> <div class="text-center space-y-2 svelte-1up4f39"><p class="text-sm text-gray-600 dark:text-gray-400 svelte-1up4f39"> </p> <a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus-visible-ring svelte-1up4f39"><!> <!></a></div></div></div></div>`);

export default function ClusteringExplainerModal($$anchor, $$props) {
	$.push($$props, true);

	const modal = createModalBehavior();
	let dialogElement = $.state(undefined);
	let closeButtonRef = $.state(undefined);
	let previousActiveElement = null;
	const KITE_PUBLIC_URL = 'https://github.com/kagisearch/kite-public';

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			$$props.onClose();

			return;
		}

		if (e.key === 'Tab' && $.get(dialogElement)) {
			const focusableElements = Array.from($.get(dialogElement).querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex="0"]'));

			if (focusableElements.length === 0) return;

			const first = focusableElements[0];
			const last = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		if ($$props.visible) {
			previousActiveElement = document.activeElement;
			scrollLock.lock();

			requestAnimationFrame(() => {
				$.get(closeButtonRef)?.focus();
			});

			return () => {
				scrollLock.unlock();

				if (previousActiveElement && 'focus' in previousActiveElement) {
					previousActiveElement.focus();
				}
			};
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var h2 = $.child(div_2);
					var text = $.only_child(h2, true);
					var button = $.sibling(h2, 2);
					var node_1 = $.child(button);

					IconX(node_1, { size: 20 });
					$.reset(button);
					$.bind_this(button, ($$value) => $.set(closeButtonRef, $$value), () => $.get(closeButtonRef));
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.sibling($.child(div_3), 2);
					var p = $.child(div_4);
					var text_1 = $.only_child(p, true);
					var p_1 = $.sibling(p, 2);
					var text_2 = $.only_child(p_1, true);
					var p_2 = $.sibling(p_1, 2);
					var text_3 = $.only_child(p_2, true);
					var p_3 = $.sibling(p_2, 2);
					var text_4 = $.only_child(p_3, true);

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var div_6 = $.sibling($.child(div_5), 2);
					var span = $.child(div_6);
					var text_5 = $.only_child(span, true);

					$.reset(div_6);
					$.reset(div_5);

					var div_7 = $.sibling(div_5, 2);
					var p_4 = $.child(div_7);
					var text_6 = $.only_child(p_4, true);
					var a = $.sibling(p_4, 2);

					$.set_attribute(a, 'href', KITE_PUBLIC_URL);

					var node_2 = $.child(a);

					IconBrandGithub(node_2, { size: 18 });

					var text_7 = $.sibling(node_2);
					var node_3 = $.sibling(text_7);

					IconExternalLink(node_3, { size: 14, class: 'opacity-70' });
					$.reset(a);
					$.reset(div_7);
					$.reset(div_3);
					$.reset(div_1);
					$.bind_this(div_1, ($$value) => $.set(dialogElement, $$value), () => $.get(dialogElement));
					$.reset(div);

					$.template_effect(
						($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
							$.set_text(text, $0);
							$.set_attribute(button, 'aria-label', $1);
							$.set_text(text_1, $2);
							$.set_text(text_2, $3);
							$.set_text(text_3, $4);
							$.set_text(text_4, $5);
							$.set_text(text_5, $6);
							$.set_text(text_6, $7);
							$.set_text(text_7, ` ${$8 ?? ''} `);
						},
						[
							() => s("stories.clusteringModal.title") || "How stories are generated",
							() => s("ui.close") || "Close",
							() => s("stories.clusteringModal.communityFeedsDescription") || "The RSS feeds for this category are put together by community members, not the Kagi team.",
							() => s("stories.clusteringModal.clusteringDescription") || "When articles from different feeds cover the same topic, they get grouped into a story. The more feeds that pick up on something, the stronger the signal.",
							() => s("stories.clusteringModal.noClusterDescription") || "If feeds don't have enough overlap in what they're covering, no clusters form and no stories show up. This is normal and happens more with niche or regional categories.",
							() => s("stories.clusteringModal.fullyAutomaticDescription") || "Nobody picks or chooses what appears. The whole process runs automatically, from pulling in feeds to clustering to writing summaries.",
							() => s("stories.clusteringModal.helpImprove") || "Help improve this category",
							() => s("stories.clusteringModal.helpImproveDescription") || "Adding more feeds makes clustering work better. You can suggest new ones on GitHub.",
							() => s("stories.clusteringModal.suggestFeeds") || "Suggest feeds on GitHub"
						]
					);

					$.delegated('click', div, (e) => modal.handleBackdropClick(e, $$props.onClose));
					$.delegated('keydown', div, handleKeydown);

					$.delegated('click', button, function (...$$args) {
						$$props.onClose?.apply(this, $$args);
					});

					$.transition(3, div_1, () => scale, () => ({
						duration: modal.getTransitionDuration(),
						start: 0.95,
						opacity: 0
					}));

					$.transition(3, div, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($$props.visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);