import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import { onMount, tick } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Backdrop from './Backdrop.svelte';
import { tocCollapsed } from './layout';

export const DEFAULT_ON_THIS_PAGE = 'On this page';

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {object} Props
		 * @property {Array<import('../markdown/anchors').Anchor>} [anchors] - The anchors to display in the TOC.
		 */
		/** @type {Props} */
		const { anchors = [] } = $$props;

		let scrollY = void 0;

		// All sections intersecting the viewport are active, Nuxt-style:
		// [firstActiveIdx, lastActiveIdx]
		let activeRange = [0, 0];

		afterNavigate(() => {
			activeRange = [0, 0];
		});

		let mounted = false;

		function computeActiveRange() {
			if (!mounted || !anchors.length) return;

			const positions = anchors.map(({ slugId }) => document.getElementById(slugId)?.offsetTop ?? 0);
			const viewportTop = scrollY ?? 0;
			const viewportBottom = viewportTop + window.innerHeight;
			const docBottom = document.documentElement.scrollHeight;
			let first = -1;
			let last = 0;

			for (let i = 0; i < positions.length; i++) {
				// a section spans from its own anchor to the next one (or page end)
				const start = positions[i];

				const end = i + 1 < positions.length ? positions[i + 1] : docBottom;

				if (start < viewportBottom && end > viewportTop) {
					if (first === -1) first = i;

					last = i;
				}
			}

			if (first === -1) first = last = 0;

			activeRange = [first, last];
		}

		onMount(() => {
			mounted = true;

			const anchorTarget = decodeURI(page.url.hash);

			if (!anchorTarget) {
				computeActiveRange();

				return;
			}

			try {
				const ele = document.querySelector(anchorTarget);

				if (ele) scrollY = ele.offsetTop;
			} catch {
				// Invalid query selector, ignore
			}

			tick().then(computeActiveRange);
		});

		function handleTocToggleClick() {
			$.store_set(tocCollapsed, !$.store_get($$store_subs ??= {}, '$tocCollapsed', tocCollapsed));
		}

		if (anchors.length) {
			$$renderer.push(`<!--[0--><div${$.attr_class('toc svelte-9b42ia', void 0, {
				'collapsed': $.store_get($$store_subs ??= {}, '$tocCollapsed', tocCollapsed)
			})}><div class="title svelte-9b42ia">${$.escape(themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE)}</div> <div class="anchors svelte-9b42ia"${$.attr_style(`--bar-top: ${activeRange[0] * 2}em; --bar-height: ${(activeRange[1] - activeRange[0] + 1) * 2}em;`)}><!--[-->`);

			const each_array = $.ensure_array_like(anchors);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let an = each_array[i];
				const active = i >= activeRange[0] && i <= activeRange[1];

				$$renderer.push(`<a${$.attr('href', `#${$.stringify(an.slugId)}`)}${$.attr_class('item svelte-9b42ia', void 0, { 'active': active })}${$.attr_style(`--heading-depth: ${$.stringify(an.depth < 2 ? 2 : an.depth)};`)}>${$.escape(an.title)}</a>`);
			}

			$$renderer.push(`<!--]--> <div class="active-bar svelte-9b42ia"></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Backdrop($$renderer, {
			show: !$.store_get($$store_subs ??= {}, '$tocCollapsed', tocCollapsed)
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}