import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../styles/pages.scss';
import { onMount } from 'svelte';
import { homepageLayout } from '$lib/stores/homepageLayout';
import HomepageCategories from '$lib/components/home/HomepageCategories.svelte';

var root = $.from_html(`<div class="loading-layout svelte-1uha8ag">Loading...</div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $currentLayout = () => $.store_get(currentLayout, '$currentLayout', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let currentLayout = $.proxy(homepageLayout);

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
	const layoutComponent = $.derived(() => $currentLayout() === 'categories' ? null : layoutComponents[$currentLayout()]?.());

	onMount(() => {
		homepageLayout.init();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HomepageCategories($$anchor, {
				get toolPages() {
					return $$props.data.toolPages;
				},

				get referencePages() {
					return $$props.data.referencePages;
				}
			});
		};

		var consequent_3 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.await(
				node_1,
				() => $.get(layoutComponent),
				($$anchor) => {
					var div = root();

					$.append($$anchor, div);
				},
				($$anchor, module) => {
					const Component = $.derived(() => $.get(module).default);
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => $.get(Component), ($$anchor, Component_1) => {
								Component_1($$anchor, { homeMode: true });
							});

							$.append($$anchor, fragment_4);
						};

						var consequent_2 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							$.component(node_4, () => $.get(Component), ($$anchor, Component_2) => {
								Component_2($$anchor, {
									get toolPages() {
										return $$props.data.toolPages;
									},

									get referencePages() {
										return $$props.data.referencePages;
									}
								});
							});

							$.append($$anchor, fragment_5);
						};

						var alternate = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.component(node_5, () => $.get(Component), ($$anchor, Component_3) => {
								Component_3($$anchor, {});
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_2, ($$render) => {
							if ($currentLayout() === 'list') $$render(consequent_1); else if ($currentLayout() === 'minimal' || $currentLayout() === 'default') $$render(consequent_2, 1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				}
			);

			$.append($$anchor, fragment_2);
		};

		var alternate_1 = ($$anchor) => {
			HomepageCategories($$anchor, {
				get toolPages() {
					return $$props.data.toolPages;
				},

				get referencePages() {
					return $$props.data.referencePages;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($currentLayout() === 'categories') $$render(consequent); else if ($.get(layoutComponent)) $$render(consequent_3, 1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}