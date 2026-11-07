import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <a href="#main-content" class="skip-to-main-content svelte-1br2sqw">Skip to main content</a> <!> <div><!> <main id="main-content" class="page-layout layout zone svelte-1br2sqw"><!></main> <!> <!> <!> <!> <!> <!> <!></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let user = $.derived(() => $$props.data.user),
		user_theme = $.derived(() => $$props.data.user_theme),
		latest = $.derived(() => $$props.data.latest);

	onNavigate(async (navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((oldStateCaptureResolve) => {
			document.startViewTransition(async () => {
				oldStateCaptureResolve();
				await navigation.complete;
			});
		});
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {});

	var node_1 = $.sibling(node, 4);

	PageLoadingIndicator(node_1, {});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	{
		var consequent = ($$anchor) => {
			Header($$anchor, {});
		};

		$.if(node_2, ($$render) => {
			if ($page().url.pathname !== '/') $$render(consequent);
		});
	}

	var main = $.sibling(node_2, 2);

	$.set_style(main, '', {}, { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' });

	var node_3 = $.child(main);

	$.snippet(node_3, () => $$props.children ?? $.noop);
	$.reset(main);

	var node_4 = $.sibling(main, 2);

	Footer(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	ThemeMaker(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			Player($$anchor, {
				get initial_show() {
					return $.get(latest)[0];
				}
			});
		};

		$.if(node_6, ($$render) => {
			if (browser) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	Toaster(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	Loading(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_2 = ($$anchor) => {
			SearchBox($$anchor, {});
		};

		$.if(node_9, ($$render) => {
			if (browser) $$render(consequent_2);
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			AdminMenu($$anchor, {});
		};

		var d = $.derived(() => $.get(user)?.roles?.includes('admin'));

		$.if(node_10, ($$render) => {
			if ($.get(d)) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, 'theme-' + $.get(user_theme) + ' theme-wrapper', 'svelte-1br2sqw'));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}