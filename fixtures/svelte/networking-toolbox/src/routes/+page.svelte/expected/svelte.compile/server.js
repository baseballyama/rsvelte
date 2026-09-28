import * as $ from 'svelte/internal/server';
import '../styles/pages.scss';
import { onMount } from 'svelte';
import { homepageLayout } from '$lib/stores/homepageLayout';
import HomepageCategories from '$lib/components/home/HomepageCategories.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let currentLayout = homepageLayout;

		// Lazy load homepage layouts (keep Categories eager as it's most common)
		const layoutComponents = {
			minimal: () => import('$lib/components/home/HomepageMinimal.svelte'),
			default: () => import('$lib/components/home/HomepageDefault.svelte'),
			carousel: () => import('$lib/components/home/HomepageCarousel.svelte'),
			bookmarks: () => import('$lib/components/home/HomepageBookmarks.svelte'),
			'small-icons': () => import('$lib/components/home/HomepageSmallIcons.svelte'),
			list: () => import('$lib/components/home/SiteMapList.svelte'),
			search: () => import('$lib/components/home/HomepageSearch.svelte'),
			empty: () => import('$lib/components/home/HomepageEmpty.svelte')
		};

		// Get the dynamic component for current layout
		const layoutComponent = $.derived(() => $.store_get($$store_subs ??= {}, '$currentLayout', currentLayout) === 'categories'
			? null
			: layoutComponents[$.store_get($$store_subs ??= {}, '$currentLayout', currentLayout)]?.());

		onMount(() => {
			homepageLayout.init();
		});

		if ($.store_get($$store_subs ??= {}, '$currentLayout', currentLayout) === 'categories') {
			$$renderer.push('<!--[0-->');

			HomepageCategories($$renderer, {
				toolPages: data.toolPages,
				referencePages: data.referencePages
			});
		} else if (layoutComponent()) {
			$$renderer.push('<!--[1-->');

			$.await(
				$$renderer,
				layoutComponent(),
				() => {
					$$renderer.push(`<div class="loading-layout svelte-1uha8ag">Loading...</div>`);
				},
				(module) => {
					const Component = module.default;

					if ($.store_get($$store_subs ??= {}, '$currentLayout', currentLayout) === 'list') {
						$$renderer.push('<!--[0-->');

						if (Component) {
							$$renderer.push('<!--[-->');
							Component($$renderer, { homeMode: true });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ($.store_get($$store_subs ??= {}, '$currentLayout', currentLayout) === 'minimal' || $.store_get($$store_subs ??= {}, '$currentLayout', currentLayout) === 'default') {
						$$renderer.push('<!--[1-->');

						if (Component) {
							$$renderer.push('<!--[-->');

							Component($$renderer, {
								toolPages: data.toolPages,
								referencePages: data.referencePages
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');

						if (Component) {
							$$renderer.push('<!--[-->');
							Component($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			HomepageCategories($$renderer, {
				toolPages: data.toolPages,
				referencePages: data.referencePages
			});
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}