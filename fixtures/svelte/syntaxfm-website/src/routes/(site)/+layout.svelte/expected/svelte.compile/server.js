import * as $ from 'svelte/internal/server';
import './style.css';
import 'media-chrome';
import 'youtube-video-element';
import { Toaster } from 'svelte-french-toast';
import { onNavigate } from '$app/navigation';
import Player from '$lib/player/Player.svelte';
import Footer from './Footer.svelte';
import Header from './Header.svelte';
import Loading from '$lib/Loading.svelte';
import { browser } from '$app/environment';
import SearchBox from '$lib/search/SearchBox.svelte';
import Meta from '$lib/meta/Meta.svelte';
import AdminMenu from '$lib/AdminMenu.svelte';
import ThemeMaker from '../../params/ThemeMaker.svelte';
import { page } from '$app/stores';
import PageLoadingIndicator from '$lib/page_loading_indicator.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children } = $$props;

		let user = $.derived(() => data.user),
			user_theme = $.derived(() => data.user_theme),
			latest = $.derived(() => data.latest);

		onNavigate(async (navigation) => {
			if (!document.startViewTransition) return;

			return new Promise((oldStateCaptureResolve) => {
				document.startViewTransition(async () => {
					oldStateCaptureResolve();
					await navigation.complete;
				});
			});
		});

		Meta($$renderer, {});
		$$renderer.push(`<!----> <a href="#main-content" class="skip-to-main-content svelte-1br2sqw">Skip to main content</a> `);
		PageLoadingIndicator($$renderer, {});
		$$renderer.push(`<!----> <div${$.attr_class('theme-' + user_theme() + ' theme-wrapper', 'svelte-1br2sqw')}>`);

		if ($.store_get($$store_subs ??= {}, '$page', page).url.pathname !== '/') {
			$$renderer.push('<!--[0-->');
			Header($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <main id="main-content" class="page-layout layout zone svelte-1br2sqw"${$.attr_style('', { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----> `);
		ThemeMaker($$renderer, {});
		$$renderer.push(`<!----> `);

		if (browser) {
			$$renderer.push('<!--[0-->');
			Player($$renderer, { initial_show: latest()[0] });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		Toaster($$renderer, {});
		$$renderer.push(`<!----> `);
		Loading($$renderer, {});
		$$renderer.push(`<!----> `);

		if (browser) {
			$$renderer.push('<!--[0-->');
			SearchBox($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (user()?.roles?.includes('admin')) {
			$$renderer.push('<!--[0-->');
			AdminMenu($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}