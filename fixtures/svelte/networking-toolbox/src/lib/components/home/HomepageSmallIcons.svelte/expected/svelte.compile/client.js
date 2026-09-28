import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<a class="icon-link svelte-126s25r"><!></a> <!>`, 1);
var root_1 = $.from_html(`<div class="small-icons-layout svelte-126s25r"><div class="search-hint svelte-126s25r"><kbd class="svelte-126s25r">⌘</kbd> <kbd class="svelte-126s25r">K</kbd> <span class="svelte-126s25r">to search</span></div> <div class="icons-grid svelte-126s25r"></div></div>`);

export default function HomepageSmallIcons($$anchor, $$props) {
	$.push($$props, true);

	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const $recentlyUsedTools = () => $.store_get(recentlyUsedTools, '$recentlyUsedTools', $$stores);
	const $activeContextMenu = () => $.store_get(activeContextMenu, '$activeContextMenu', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Rainbow gradient configuration
	const HUE_STEP = 10; // How quickly colors change along diagonal

	const SATURATION = 60; // Color saturation (0-100)
	const LIGHTNESS = 60; // Color lightness (0-100)

	// Filter out non-tool pages
	const toolPages = ALL_PAGES.filter((page) => page.icon);

	let gridElement;
	let iconHues = $.state($.proxy([]));
	let gridCols = $.state(1);

	// Memoized function to get grid column count
	function updateGridCols() {
		if (!gridElement) return;

		const gridStyle = window.getComputedStyle(gridElement);

		$.set(gridCols, gridStyle.gridTemplateColumns.split(' ').length, true);
	}

	function updateIconColors() {
		if (!gridElement) return;

		updateGridCols();

		$.set(
			iconHues,
			toolPages.map((_, index) => {
				const row = Math.floor(index / $.get(gridCols));
				const col = index % $.get(gridCols);
				const diagonalIndex = row + col;

				return diagonalIndex * HUE_STEP % 360;
			}),
			true
		);
	}

	function getAnimDelay(index) {
		if (!gridElement || $.get(gridCols) === 0) return 0;

		const row = Math.floor(index / $.get(gridCols));
		const col = index % $.get(gridCols);

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

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 23, () => toolPages, (tool) => tool.href, ($$anchor, tool, index) => {
		const menuId = $.derived(() => getToolContextMenuId($.get(tool)));

		const menuItems = $.derived(() => getToolContextMenuItems({
			tool: $.get(tool),
			bookmarkedTools: $bookmarks(),
			recentTools: $recentlyUsedTools()
		}));

		const hue = $.derived(() => $.get(iconHues)[$.get(index)] ?? 0);
		const animDelay = $.derived(() => getAnimDelay($.get(index)));
		var fragment = root();
		var a = $.first_child(fragment);
		var node = $.child(a);

		{
			let $0 = $.derived(() => $.get(tool).icon || '');

			Icon(node, {
				get name() {
					return $.get($0);
				},
				size: 'xl'
			});
		}

		$.reset(a);
		$.action(a, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(tool).label);

		var node_1 = $.sibling(a, 2);

		{
			var consequent = ($$anchor) => {
				ContextMenu($$anchor, {
					get x() {
						return $activeContextMenu().x;
					},

					get y() {
						return $activeContextMenu().y;
					},

					get items() {
						return $.get(menuItems);
					},
					onClose: () => activeContextMenu.close()
				});
			};

			$.if(node_1, ($$render) => {
				if ($activeContextMenu().id === $.get(menuId)) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(tool).href);
			$.set_style(a, `--icon-hue: ${$.get(hue) ?? ''}; --icon-color: hsl(${$.get(hue) ?? ''}, 60%, 60%); --anim-delay: ${$.get(animDelay) ?? ''}s;`);
		});

		$.delegated('contextmenu', a, (e) => handleToolContextMenu(e, $.get(tool)));
		$.append($$anchor, fragment);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => gridElement = $$value, () => gridElement);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['contextmenu']);