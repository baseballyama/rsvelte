import * as $ from 'svelte/internal/server';
import { Globe } from 'lucide-svelte';
import { onDestroy, tick } from 'svelte';

export default function SitePreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { site, style, src } = $$props;
		let container = void 0;
		let scale = void 0;
		let iframeHeight = void 0;
		let iframe = void 0;
		let iframeLoaded = void 0;
		let resize_observer = void 0;

		async function init_preview() {
			await tick();

			// if (!iframe?.contentWindow?.document?.body) return
			if (resize_observer) resize_observer?.disconnect();

			resize_observer = new ResizeObserver((entries) => {
				const { offsetWidth: parentWidth } = container;
				const { offsetWidth: childWidth } = iframe;

				if (parentWidth === 0) return;

				scale = parentWidth / childWidth;
				iframeHeight = `${100 / scale}%`;

				// give it a sec to load in
				setTimeout(
					() => {
						iframeLoaded = true;
					},
					200
				);
			});

			resize_observer.observe(container);
		}

		function resize_preview() {
			if (!container || !iframe) return;

			const { clientWidth: parentWidth } = container;
			const { clientWidth: childWidth } = iframe;

			scale = parentWidth / childWidth;
			iframeHeight = `${100 / scale}%`;
		}

		onDestroy(() => {
			resize_observer?.disconnect();
		});

		$$renderer.push(`<div class="iframe-root bg-gray-900 svelte-d5jpdx"${$.attr_style(style)}><div class="iframe-container svelte-d5jpdx">`);

		if (site && (src || site.preview)) {
			$$renderer.push(`<!--[0--><iframe tabindex="-1"${$.attr_class('w-[1024px] rounded overflow-hidden bg-white svelte-d5jpdx', void 0, { 'fadein': iframeLoaded })} title="site preview"${$.attr('src', src ?? `/?_site=${site.id}`)}${$.attr_style('', {
				transform: `scale(${$.stringify(scale)})`,
				height: iframeHeight
			})} onload="this.__e=event"></iframe>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="h-full flex justify-center items-center">`);
			Globe($$renderer, { color: 'white', size: '5rem' });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}