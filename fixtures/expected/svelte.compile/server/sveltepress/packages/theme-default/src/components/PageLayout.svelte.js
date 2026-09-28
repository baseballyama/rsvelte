import * as $ from 'svelte/internal/server';
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

export default function PageLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeId = $.derived(() => page.route.id);

		// The frontmatter info. This would be injected by sveltepress
		const { fm, children, heroImage } = $$props;

		const {
			pageType,
			lastUpdate,
			anchors: fmAnchors = [],
			sidebar: fmSidebar = true,
			header = true,
			layout = true
		} = fm;

		$.store_set(sidebar, fmSidebar);
		$.store_set(showHeader, header);
		$.store_set(showLayout, layout);

		const isHome = $.derived(() => routeId() === '/' && fm.home !== false);

		anchors.set(fmAnchors);

		let ready = false;

		beforeNavigate(() => {
			ready = false;
		});

		afterNavigate(() => {
			tick().then(() => {
				ready = true;
			});
		});

		$.head('u5a9kx', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(fm.title
					? `${fm.title} - ${siteConfig.title}`
					: siteConfig.title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', fm.description || siteConfig.description)}/>`);
		});

		if (layout === false) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			function defaultHeroImage($$renderer) {
				if (fm.heroImage) {
					$$renderer.push('<!--[0-->');
					HeroImage($$renderer, { heroImage: fm.heroImage });
				} else {
					$$renderer.push('<!--[-1-->');
					HeroCode($$renderer, {});
				}

				$$renderer.push(`<!--]-->`);
			}

			if (!isHome()) {
				$$renderer.push(`<!--[0--><div pb-4="" class="theme-default--page-layout"><div class="content svelte-u5a9kx">`);

				if (fm.title) {
					$$renderer.push(`<!--[0--><h1 class="page-title svelte-u5a9kx">${$.escape(fm.title)}</h1>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				children?.($$renderer);
				$$renderer.push(`<!----> <div${$.attr_class('meta svelte-u5a9kx', void 0, { 'without-edit-link': !themeOptions.editLink })}>`);

				if (themeOptions.editLink) {
					$$renderer.push('<!--[0-->');
					EditPage($$renderer, { pageType });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				LastUpdate($$renderer, { lastUpdate });
				$$renderer.push(`<!----></div> `);

				if (ready && $.store_get($$store_subs ??= {}, '$pages', pages).length) {
					$$renderer.push('<!--[0-->');
					PageSwitcher($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else if (fm.home !== false) {
				$$renderer.push('<!--[1-->');

				Home($$renderer, $.spread_props([
					fm,
					{
						siteConfig,
						heroImage: heroImage ?? defaultHeroImage,
						children
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}