import * as $ from 'svelte/internal/server';
import { IconBrandGithub, IconExternalLink, IconX } from '@tabler/icons-svelte';
import { fade, scale } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { scrollLock } from '$lib/utils/scrollLock.js';

export default function ClusteringExplainerModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { visible, onClose } = $$props;
		const modal = createModalBehavior();
		let dialogElement = undefined;
		let closeButtonRef = undefined;
		let previousActiveElement = null;
		const KITE_PUBLIC_URL = 'https://github.com/kagisearch/kite-public';

		function handleKeydown(e) {
			if (e.key === 'Escape') {
				onClose();

				return;
			}

			if (e.key === 'Tab' && dialogElement) {
				const focusableElements = Array.from(dialogElement.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex="0"]'));

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

		if (visible) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 svelte-1up4f39" role="dialog" aria-modal="true" aria-labelledby="clustering-title" tabindex="-1"><div class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-y-auto svelte-1up4f39" role="document"><div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 svelte-1up4f39"><h2 id="clustering-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 svelte-1up4f39">${$.escape(s("stories.clusteringModal.title") || "How stories are generated")}</h2> <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible-ring svelte-1up4f39"${$.attr('aria-label', s("ui.close") || "Close")}>`);
					IconX($$renderer, { size: 20 });
					$$renderer.push(`<!----></button></div> <div class="p-5 space-y-5 svelte-1up4f39"><div class="flex justify-center svelte-1up4f39" aria-hidden="true"><svg class="clustering-illustration svelte-1up4f39" viewBox="0 0 280 120" width="280" height="120"><circle class="dot dot-cluster-a dot-a1 svelte-1up4f39" cx="30" cy="20" r="6" fill="#3b82f6" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a2 svelte-1up4f39" cx="80" cy="90" r="6" fill="#6366f1" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a3 svelte-1up4f39" cx="50" cy="55" r="6" fill="#8b5cf6" opacity="0.7"></circle><circle class="dot dot-cluster-a dot-a4 svelte-1up4f39" cx="15" cy="70" r="5" fill="#a78bfa" opacity="0.6"></circle><circle class="dot dot-cluster-a dot-a5 svelte-1up4f39" cx="75" cy="30" r="5" fill="#818cf8" opacity="0.6"></circle><circle class="dot dot-cluster-b dot-b1 svelte-1up4f39" cx="200" cy="25" r="6" fill="#10b981" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b2 svelte-1up4f39" cx="250" cy="80" r="6" fill="#14b8a6" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b3 svelte-1up4f39" cx="220" cy="65" r="6" fill="#06b6d4" opacity="0.7"></circle><circle class="dot dot-cluster-b dot-b4 svelte-1up4f39" cx="265" cy="35" r="5" fill="#34d399" opacity="0.6"></circle><circle class="dot dot-lone dot-l1 svelte-1up4f39" cx="140" cy="30" r="5" fill="#f59e0b" opacity="0.7"></circle><circle class="dot dot-lone dot-l2 svelte-1up4f39" cx="150" cy="100" r="5" fill="#ef4444" opacity="0.7"></circle><circle class="dot dot-lone dot-l3 svelte-1up4f39" cx="125" cy="70" r="4" fill="#f97316" opacity="0.6"></circle><circle class="cluster-ring ring-a svelte-1up4f39" cx="55" cy="55" r="26" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0"></circle><circle class="cluster-ring ring-b svelte-1up4f39" cx="228" cy="52" r="24" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0"></circle><text class="cluster-label label-a svelte-1up4f39" x="55" y="92" text-anchor="middle" font-size="9" fill="#6366f1" opacity="0">story</text><text class="cluster-label label-b svelte-1up4f39" x="228" y="87" text-anchor="middle" font-size="9" fill="#10b981" opacity="0">story</text></svg></div> <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400 svelte-1up4f39"><p class="svelte-1up4f39">${$.escape(s("stories.clusteringModal.communityFeedsDescription") || "The RSS feeds for this category are put together by community members, not the Kagi team.")}</p> <p class="svelte-1up4f39">${$.escape(s("stories.clusteringModal.clusteringDescription") || "When articles from different feeds cover the same topic, they get grouped into a story. The more feeds that pick up on something, the stronger the signal.")}</p> <p class="svelte-1up4f39">${$.escape(s("stories.clusteringModal.noClusterDescription") || "If feeds don't have enough overlap in what they're covering, no clusters form and no stories show up. This is normal and happens more with niche or regional categories.")}</p> <p class="svelte-1up4f39">${$.escape(s("stories.clusteringModal.fullyAutomaticDescription") || "Nobody picks or chooses what appears. The whole process runs automatically, from pulling in feeds to clustering to writing summaries.")}</p></div> <div class="relative svelte-1up4f39"><div class="absolute inset-0 flex items-center svelte-1up4f39"><div class="w-full border-t border-gray-200 dark:border-gray-700 svelte-1up4f39"></div></div> <div class="relative flex justify-center text-xs svelte-1up4f39"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500 svelte-1up4f39">${$.escape(s("stories.clusteringModal.helpImprove") || "Help improve this category")}</span></div></div> <div class="text-center space-y-2 svelte-1up4f39"><p class="text-sm text-gray-600 dark:text-gray-400 svelte-1up4f39">${$.escape(s("stories.clusteringModal.helpImproveDescription") || "Adding more feeds makes clustering work better. You can suggest new ones on GitHub.")}</p> <a${$.attr('href', KITE_PUBLIC_URL)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus-visible-ring svelte-1up4f39">`);
					IconBrandGithub($$renderer, { size: 18 });
					$$renderer.push(`<!----> ${$.escape(s("stories.clusteringModal.suggestFeeds") || "Suggest feeds on GitHub")} `);
					IconExternalLink($$renderer, { size: 14, class: 'opacity-70' });
					$$renderer.push(`<!----></a></div></div></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}