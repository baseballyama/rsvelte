import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { ALL_PAGES } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';
import ContextMenu from '$lib/components/global/ContextMenu.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { activeContextMenu } from '$lib/stores/contextMenu';
import { bookmarks } from '$lib/stores/bookmarks';
import { recentlyUsedTools } from '$lib/stores/toolUsage';

import {
	handleToolContextMenu,
	getToolContextMenuId,
	getToolContextMenuItems
} from '$lib/utils/tool-context-menu';

export default function HomepageSmallIcons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Rainbow gradient configuration
		const HUE_STEP = 10; // How quickly colors change along diagonal

		const SATURATION = 60; // Color saturation (0-100)
		const LIGHTNESS = 60; // Color lightness (0-100)

		// Filter out non-tool pages
		const toolPages = ALL_PAGES.filter((page) => page.icon);

		let gridElement;
		let iconHues = [];
		let gridCols = 1;

		// Memoized function to get grid column count
		function updateGridCols() {
			if (!gridElement) return;

			const gridStyle = window.getComputedStyle(gridElement);

			gridCols = gridStyle.gridTemplateColumns.split(' ').length;
		}

		function updateIconColors() {
			if (!gridElement) return;

			updateGridCols();

			iconHues = toolPages.map((_, index) => {
				const row = Math.floor(index / gridCols);
				const col = index % gridCols;
				const diagonalIndex = row + col;

				return diagonalIndex * HUE_STEP % 360;
			});
		}

		function getAnimDelay(index) {
			if (!gridElement || gridCols === 0) return 0;

			const row = Math.floor(index / gridCols);
			const col = index % gridCols;

			return (row + col) * 0.03; // 30ms per diagonal step
		}

		onMount(() => {
			bookmarks.init();
			updateIconColors();

			let resizeTimer;

			const handleResize = () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(updateIconColors, 100);
			};

			window.addEventListener('resize', handleResize);

			return () => window.removeEventListener('resize', handleResize);
		});

		$$renderer.push(`<div class="small-icons-layout svelte-126s25r"><div class="search-hint svelte-126s25r"><kbd class="svelte-126s25r">⌘</kbd> <kbd class="svelte-126s25r">K</kbd> <span class="svelte-126s25r">to search</span></div> <div class="icons-grid svelte-126s25r"><!--[-->`);

		const each_array = $.ensure_array_like(toolPages);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let tool = each_array[index];
			const menuId = getToolContextMenuId(tool);

			const menuItems = getToolContextMenuItems({
				tool,
				bookmarkedTools: $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks),
				recentTools: $.store_get($$store_subs ??= {}, '$recentlyUsedTools', recentlyUsedTools)
			});

			const hue = iconHues[index] ?? 0;
			const animDelay = getAnimDelay(index);

			$$renderer.push(`<a${$.attr('href', tool.href)} class="icon-link svelte-126s25r"${$.attr_style(`--icon-hue: ${$.stringify(hue)}; --icon-color: hsl(${$.stringify(hue)}, 60%, 60%); --anim-delay: ${$.stringify(animDelay)}s;`)}>`);
			Icon($$renderer, { name: tool.icon || '', size: 'xl' });
			$$renderer.push(`<!----></a> `);

			if ($.store_get($$store_subs ??= {}, '$activeContextMenu', activeContextMenu).id === menuId) {
				$$renderer.push('<!--[0-->');

				ContextMenu($$renderer, {
					x: $.store_get($$store_subs ??= {}, '$activeContextMenu', activeContextMenu).x,
					y: $.store_get($$store_subs ??= {}, '$activeContextMenu', activeContextMenu).y,
					items: menuItems,
					onClose: () => activeContextMenu.close()
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}