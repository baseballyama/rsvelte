import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { page } from '$app/state';
import { tick } from 'svelte';
import siteConfig from 'virtual:sveltepress/site';
import themeOptions from 'virtual:sveltepress/theme-default';
import EditPage from './EditPage.svelte';
import Home from './Home.svelte';
import HeroCode from './home/HeroCode.svelte';
import HeroImage from './home/HeroImage.svelte';
import LastUpdate from './LastUpdate.svelte';
import { anchors, pages, showHeader, showLayout, sidebar } from './layout';
import PageSwitcher from './PageSwitcher.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<h1 class="page-title svelte-u5a9kx"> </h1>`);
var root_2 = $.from_html(`<div pb-4="" class="theme-default--page-layout"><div class="content svelte-u5a9kx"><!> <!> <div><!> <!></div> <!></div></div>`);

export default function PageLayout($$anchor, $$props) {
	$.push($$props, true);

	const $sidebar = () => $.store_get(sidebar, '$sidebar', $$stores);
	const $showHeader = () => $.store_get(showHeader, '$showHeader', $$stores);
	const $showLayout = () => $.store_get(showLayout, '$showLayout', $$stores);
	const $pages = () => $.store_get(pages, '$pages', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const routeId = $.derived(() => page.route.id);

	// The frontmatter info. This would be injected by sveltepress
	const {
		pageType,
		lastUpdate,
		anchors: fmAnchors = [],
		sidebar: fmSidebar = true,
		header = true,
		layout = true
	} = $$props.fm;

	$.store_set(sidebar, fmSidebar);
	$.store_set(showHeader, header);
	$.store_set(showLayout, layout);

	const isHome = $.derived(() => $.get(routeId) === '/' && $$props.fm.home !== false);

	anchors.set(fmAnchors);

	let ready = $.state(false);

	beforeNavigate(() => {
		$.set(ready, false);
	});

	afterNavigate(() => {
		tick().then(() => {
			$.set(ready, true);
		});
	});

	var fragment = $.comment();

	$.head('u5a9kx', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', $$props.fm.description || siteConfig.description));

		$.deferred_template_effect(() => {
			$.document.title = ($$props.fm.title
				? `${$$props.fm.title} - ${siteConfig.title}`
				: siteConfig.title) ?? '';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			const defaultHeroImage = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent_1 = ($$anchor) => {
						HeroImage($$anchor, {
							get heroImage() {
								return $$props.fm.heroImage;
							}
						});
					};

					var alternate = ($$anchor) => {
						HeroCode($$anchor, {});
					};

					$.if(node_2, ($$render) => {
						if ($$props.fm.heroImage) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			};

			var fragment_5 = $.comment();
			var node_3 = $.first_child(fragment_5);

			{
				var consequent_5 = ($$anchor) => {
					var div = root_2();
					var div_1 = $.child(div);
					var node_4 = $.child(div_1);

					{
						var consequent_2 = ($$anchor) => {
							var h1 = root_1();
							var text = $.only_child(h1, true);

							$.template_effect(() => $.set_text(text, $$props.fm.title));
							$.append($$anchor, h1);
						};

						$.if(node_4, ($$render) => {
							if ($$props.fm.title) $$render(consequent_2);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					$.snippet(node_5, () => $$props.children ?? $.noop);

					var div_2 = $.sibling(node_5, 2);
					let classes;
					var node_6 = $.child(div_2);

					{
						var consequent_3 = ($$anchor) => {
							EditPage($$anchor, {
								get pageType() {
									return pageType;
								}
							});
						};

						$.if(node_6, ($$render) => {
							if (themeOptions.editLink) $$render(consequent_3);
						});
					}

					var node_7 = $.sibling(node_6, 2);

					LastUpdate(node_7, {
						get lastUpdate() {
							return lastUpdate;
						}
					});

					$.reset(div_2);

					var node_8 = $.sibling(div_2, 2);

					{
						var consequent_4 = ($$anchor) => {
							PageSwitcher($$anchor, {});
						};

						$.if(node_8, ($$render) => {
							if ($.get(ready) && $pages().length) $$render(consequent_4);
						});
					}

					$.reset(div_1);
					$.reset(div);
					$.template_effect(() => classes = $.set_class(div_2, 1, 'meta svelte-u5a9kx', null, classes, { 'without-edit-link': !themeOptions.editLink }));
					$.append($$anchor, div);
				};

				var consequent_6 = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.heroImage ?? defaultHeroImage);

						Home($$anchor, $.spread_props(() => $$props.fm, {
							get siteConfig() {
								return siteConfig;
							},

							get heroImage() {
								return $.get($0);
							},

							get children() {
								return $$props.children;
							}
						}));
					}
				};

				$.if(node_3, ($$render) => {
					if (!$.get(isHome)) $$render(consequent_5); else if ($$props.fm.home !== false) $$render(consequent_6, 1);
				});
			}

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if (layout === false) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}