import * as $ from 'svelte/internal/server';
import SitePreview from '$lib/components/SitePreview.svelte';
import { ExternalLink } from 'lucide-svelte';
import { Site } from '$lib/common/models/Site';

export default function MarketplaceStarterButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {Site} site
		 * @property {any} [preview]
		 * @property {string} [append]
		 */
		/** @type {Props} */
		let { site, preview = null, append = '' } = $$props;

		let container = void 0;
		let scale = void 0;
		let iframeHeight = void 0;
		let iframe = void 0;

		function resizePreview() {
			const { clientWidth: parentWidth } = container;
			const { clientWidth: childWidth } = iframe;

			scale = parentWidth / childWidth;
			iframeHeight = `${100 / scale}%`;
		}

		function append_to_iframe(code) {
			var container = document.createElement('div');

			// Set the innerHTML of the container to your HTML string
			container.innerHTML = code;

			// Append each element in the container to the document head
			Array.from(container.childNodes).forEach((node) => {
				iframe.contentWindow.document.body.appendChild(node);
			});
		}

		// wait for processor to load before building preview
		let processorLoaded = false;

		setTimeout(
			() => {
				processorLoaded = true;
			},
			500
		);

		$$renderer.push(`<div class="space-y-3 relative w-full aspect-[.69] bg-gray-900"><div class="rounded-tl rounded-tr overflow-hidden"><a${$.attr('href', `https://${site.host}`)} target="_blank" rel="noopener noreferrer" class="w-full hover:opacity-75 transition-all block">`);

		SitePreview($$renderer, {
			site,
			style: '--thumbnail-height: 140%',
			src: `https://${site.host}`
		});

		$$renderer.push(`<!----></a></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between"><div class="flex items-center gap-2"><div class="text-sm font-medium leading-none">${$.escape(site.name)}</div> <div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div></div> <a${$.attr('href', `https://${site.host}`)} target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"><span>Preview</span> `);
		ExternalLink($$renderer, { class: 'h-3 w-3' });
		$$renderer.push(`<!----></a></div></div>`);
		$.bind_props($$props, { preview });
	});
}