import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { findToolByHref } from '$lib/utils/nav-helpers';
import { tooltip } from '$lib/actions/tooltip';

export default function ToolContentContainer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			title,
			description,
			navOptions,
			selectedNav = void 0,
			onNavChange,
			contentClass,
			children,
			hideLabels: propHideLabels = false
		} = $$props;

		let hideLabels = false;

		function updateHideLabels() {
			hideLabels = propHideLabels || window.innerWidth < 768;
		}

		const currentPath = $.derived(() => $.store_get($$store_subs ??= {}, '$page', page).url.pathname);
		const currentTool = $.derived(() => findToolByHref(currentPath()));

		const isBookmarked = $.derived(() => currentTool()
			? bookmarks.isBookmarked(currentTool().href, $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks))
			: false);

		const tooltipText = $.derived(() => currentTool()
			? isBookmarked()
				? `Remove ${currentTool().label} from bookmarks`
				: `Bookmark ${currentTool().label} for quick access and offline use`
			: '');

		onMount(() => {
			updateHideLabels();
			window.addEventListener('resize', updateHideLabels);
			bookmarks.init();

			return () => window.removeEventListener('resize', updateHideLabels);
		});

		function toggleBookmark(e) {
			e.preventDefault();
			e.stopPropagation();

			if (!currentTool()) return;

			const bookmarkedTool = {
				href: currentTool().href,
				label: currentTool().label,
				description: currentTool().description || '',
				icon: currentTool().icon || 'default'
			};

			bookmarks.toggle(bookmarkedTool);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="card svelte-zg8wei" role="region"><header class="card-header svelte-zg8wei"><div class="header-content svelte-zg8wei"><div class="title-row svelte-zg8wei"><h1 class="svelte-zg8wei">${$.escape(title)}</h1> `);

			if (currentTool()) {
				$$renderer.push(`<!--[0--><button${$.attr_class('bookmark-btn svelte-zg8wei', void 0, { 'bookmarked': isBookmarked() })}${$.attr('aria-label', isBookmarked() ? 'Remove bookmark' : 'Add bookmark')}><div class="bookmark-icon svelte-zg8wei">`);

				if (isBookmarked()) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { name: 'bookmarks', size: 'sm' });
				} else {
					$$renderer.push('<!--[-1-->');
					Icon($$renderer, { name: 'bookmark-add', size: 'md' });
				}

				$$renderer.push(`<!--]--></div> `);

				if (isBookmarked()) {
					$$renderer.push(`<!--[0--><div class="bookmark-icon bookmark-icon-hover svelte-zg8wei">`);
					Icon($$renderer, { name: 'bookmark-remove', size: 'sm' });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <p class="svelte-zg8wei">${$.escape(description)}</p></div> `);

			if (navOptions && selectedNav !== undefined) {
				$$renderer.push(`<!--[0--><div class="header-controls svelte-zg8wei">`);

				SegmentedControl($$renderer, {
					options: navOptions,
					onchange: onNavChange,
					hideLabel: hideLabels,
					get value() {
						return selectedNav;
					},

					set value($$value) {
						selectedNav = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></header> `);

			if (contentClass) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(contentClass), 'svelte-zg8wei')}>`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { selectedNav });
	});
}