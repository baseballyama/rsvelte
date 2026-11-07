import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toc } from '@svelte-put/toc';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { navigating, page } from '$app/stores';
import { ColorSchemeMenu } from '$lib/components/color-scheme-menu';
import { MenuLabel } from '$lib/components/menu-label';
import { PageLoadIndicator } from '$lib/components/page-load-indicator/';
import { StatusBadge } from '$lib/components/status-badge';
import { SOCIAL_LINKS } from '$lib/constants';
import NotificationPortal from '$lib/notifications/components/NotificationPortal.svelte';
import Svelte5 from '$lib/notifications/components/Svelte5.svelte';
import { NotificationContext } from '$lib/notifications/context.svelte';

var root = $.from_html(`<a class="c-btn c-btn--outlined gap-2 py-1.5 pl-3 pr-4" href="/search"><i class="i i-[magnifying-glass] h-5 w-5"></i> <span class="text-sm">Search...</span></a>`);
var root_1 = $.from_html(`<a class="c-link-lazy current:border-link current:text-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3"> </a>`);
var root_2 = $.from_html(`<li><a class="current:text-link c-link-lazy current:border-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3"><span class="bg-primary h-full w-1"></span> <sup><!></sup></a></li>`);
var root_3 = $.from_html(`<li><a class="current:text-link c-link-lazy current:border-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3"><span class="bg-primary h-full w-1"></span> </a></li>`);
var root_4 = $.from_html(`<main class="prose dark:prose-invert svelte-lp2mpd"><!></main>`);
var root_5 = $.from_html(`<li><a class="c-link-lazy current:border-link current:text-link -ml-px block border-l border-transparent py-1 capitalize"></a></li>`);
var root_6 = $.from_html(`<p class="py-2 font-bold uppercase">On This Page</p> <ul class="border-outline space-y-1 border-l"></ul>`, 1);

var root_7 = $.from_html(
	`<!> <div class="pt-header relative flex w-full flex-1 flex-col svelte-lp2mpd" id="docs"><header class="z-header h-header border-outline fixed inset-x-0 top-0 flex flex-col border-b svelte-lp2mpd"><nav class="max-w-pad flex flex-1 items-center py-2" aria-label="header"><a href="/" class="mr-auto flex items-center gap-2"><svg class="h-8 w-8 shrink-0" inline-src="svelte-put" width="32" height="32"></svg> <span class="font-fingerpaint text-gradient-brand text-sm font-bold">svelte-put</span></a> <!> <!> <a data-external="" class="c-link-icon ml-5"><svg inline-src="simpleicon/github" height="28" width="28"></svg> <span class="sr-only">Github</span></a></nav> <div class="max-w-pad border-outline desktop:justify-end widescreen:hidden flex flex-1 items-center justify-between
			border-t py-1"><!> <!></div></header> <div class="max-w-pad flex items-stretch"><nav class="sidebar sidebar-left svelte-lp2mpd" aria-label="pages"><input id="pages-toggler" type="checkbox" hidden="" class="svelte-lp2mpd"/> <ul class="sidebar-content space-y-4 text-sm svelte-lp2mpd"><li><p class="font-bold uppercase">Overview</p> <ul class="border-outline mt-3 space-y-1 border-l"><li></li></ul></li> <li><p class="font-bold uppercase">Packages</p> <ul class="border-outline mt-3 space-y-1 border-l"><!> <li class="pt-4"><p class="border-t pl-3 pt-4 font-bold uppercase">Deprecated</p> <ul class="mt-3"></ul></li></ul></li></ul></nav> <label class="sidebar-backdrop svelte-lp2mpd" for="pages-toggler"></label> <!> <nav class="sidebar sidebar-right svelte-lp2mpd" aria-label="table of contents"><p class="c-callout c-callout--success c-callout--icon-megaphone upto-widescreen:hidden mt-10">Still on Svelte 4? See <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old docs site here.</a></p> <div class="sveltevietnam-banner upto-widescreen:hidden mt-5 space-y-2 rounded border p-4"><p class="font-medium">Are you based in Vietnam?</p> <div class="flex items-center gap-4"><div class="i i-sveltename h-10 w-10 shrink-0"></div> <p>Join the <a class="c-link" href="https://www.sveltevietnam.dev">Svelte Vietnam</a> community.</p></div></div> <input id="toc-toggler" type="checkbox" hidden="" class="svelte-lp2mpd"/> <div class="sidebar-content text-sm svelte-lp2mpd"><!></div></nav></div></div> <!>`,
	1
);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const $navigating = () => $.store_get(navigating, '$navigating', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const TOP_LEVEL_PATHS = {
		Introduction: '/docs',
		Architecture: '/docs/architecture',
		Guidelines: '/docs/guidelines',
		Contributing: '/docs/contributing'
	};

	const toc = new Toc({
		selector: ':where(h2, h3, h4, h5, h6)',
		observe: { enabled: true, link: { activeAttribute: 'data-current' } }
	});

	let isleftSidebarOpen = $.state(false);

	function closeLeftSidebar() {
		$.set(isleftSidebarOpen, false);
	}

	let hydrated = $.state(false);
	const { stack } = NotificationContext.set();

	onMount(() => {
		$.set(hydrated, true);

		const url = $page().url;

		if (url.searchParams.has('color-scheme')) {
			url.searchParams.delete('color-scheme');
			goto(url, { replaceState: true });
		}

		if (!localStorage.getItem('skip-svelte-5-notification')) {
			stack.push('custom', { component: Svelte5, timeout: 10_000 });
		}
	});

	var fragment = root_7();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PageLoadIndicator($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($navigating()) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var header = $.child(div);
	var nav = $.child(header);
	var node_1 = $.sibling($.child(nav), 2);

	{
		var consequent_1 = ($$anchor) => {
			var a = root();

			$.append($$anchor, a);
		};

		$.if(node_1, ($$render) => {
			if ($.get(hydrated)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	ColorSchemeMenu(node_2, { class: 'ml-5' });

	var a_1 = $.sibling(node_2, 2);

	$.reset(nav);

	var div_1 = $.sibling(nav, 2);
	var node_3 = $.child(div_1);

	MenuLabel(node_3, {
		class: 'desktop:hidden',
		for: 'pages-toggler',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Navigation');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	MenuLabel(node_4, {
		align: 'right',
		for: 'toc-toggler',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Table of Contents');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(header);

	var div_2 = $.sibling(header, 2);
	var nav_1 = $.child(div_2);
	var input = $.child(nav_1);

	$.remove_input_defaults(input);

	var ul = $.sibling(input, 2);
	var li = $.child(ul);
	var ul_1 = $.sibling($.child(li), 2);
	var li_1 = $.child(ul_1);

	$.each(li_1, 21, () => Object.entries(TOP_LEVEL_PATHS), $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let label = () => $.get($$array)[0];
		let path = () => $.get($$array)[1];
		var a_2 = root_1();
		var text_2 = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', path());
			$.set_attribute(a_2, 'data-current', $$props.data.pathname === path());
			$.set_text(text_2, label());
		});

		$.append($$anchor, a_2);
	});

	$.reset(li_1);
	$.reset(ul_1);
	$.reset(li);

	var li_2 = $.sibling(li, 2);
	var ul_2 = $.sibling($.child(li_2), 2);
	var node_5 = $.child(ul_2);

	$.each(node_5, 17, () => $$props.data.packages.active, ({ id, status }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let status = () => $.get($$item).status;
		var li_3 = root_2();
		var a_3 = $.child(li_3);
		var text_3 = $.sibling($.child(a_3));
		var sup = $.sibling(text_3);
		var node_6 = $.child(sup);

		{
			var consequent_2 = ($$anchor) => {
				StatusBadge($$anchor, {
					get status() {
						return status();
					}
				});
			};

			$.if(node_6, ($$render) => {
				if (status() !== 'stable' && status() !== 'deprecated') $$render(consequent_2);
			});
		}

		$.reset(sup);
		$.reset(a_3);
		$.reset(li_3);

		$.template_effect(
			($0) => {
				$.set_attribute(a_3, 'href', `/docs/${id() ?? ''}`);
				$.set_attribute(a_3, 'data-current', $0);
				$.set_text(text_3, ` ${id() ?? ''} `);
			},
			[() => $$props.data.pathname.includes(`/${id()}`)]
		);

		$.delegated('click', a_3, closeLeftSidebar);
		$.append($$anchor, li_3);
	});

	var li_4 = $.sibling(node_5, 2);
	var ul_3 = $.sibling($.child(li_4), 2);

	$.each(ul_3, 21, () => $$props.data.packages.deprecated, ({ id }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		var li_5 = root_3();
		var a_4 = $.child(li_5);
		var text_4 = $.sibling($.child(a_4));

		$.reset(a_4);
		$.reset(li_5);

		$.template_effect(
			($0) => {
				$.set_attribute(a_4, 'href', `/docs/${id() ?? ''}`);
				$.set_attribute(a_4, 'data-current', $0);
				$.set_text(text_4, ` ${id() ?? ''}`);
			},
			[() => $$props.data.pathname.includes(`/${id()}`)]
		);

		$.delegated('click', a_4, closeLeftSidebar);
		$.append($$anchor, li_5);
	});

	$.reset(ul_3);
	$.reset(li_4);
	$.reset(ul_2);
	$.reset(li_2);
	$.reset(ul);
	$.reset(nav_1);

	var node_7 = $.sibling(nav_1, 4);

	$.key(node_7, () => $$props.data.pathname, ($$anchor) => {
		var main = root_4();
		var node_8 = $.child(main);

		$.snippet(node_8, () => $$props.children);
		$.reset(main);
		$.action(main, ($$node) => toc.actions.root?.($$node));
		$.append($$anchor, main);
	});

	var nav_2 = $.sibling(node_7, 2);
	var div_3 = $.sibling($.child(nav_2), 6);
	var node_9 = $.child(div_3);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_3 = root_6();
			var ul_4 = $.sibling($.first_child(fragment_3), 2);

			$.each(ul_4, 21, () => toc.items.values(), (tocItem) => tocItem.id, ($$anchor, tocItem) => {
				const level = $.derived(() => $.get(tocItem).element.tagName.slice(1));
				var li_6 = root_5();
				var a_5 = $.child(li_6);
				let styles;

				$.action(a_5, ($$node, $$action_arg) => toc.actions.link?.($$node, $$action_arg), () => $.get(tocItem));
				$.reset(li_6);
				$.template_effect(() => styles = $.set_style(a_5, '', styles, { 'padding-left': `calc((${$.get(level) ?? ''} - 1) * 2ch)` }));
				$.append($$anchor, li_6);
			});

			$.reset(ul_4);
			$.append($$anchor, fragment_3);
		};

		$.if(node_9, ($$render) => {
			if (toc.items.size) $$render(consequent_3);
		});
	}

	$.reset(div_3);
	$.reset(nav_2);
	$.reset(div_2);
	$.reset(div);

	var node_10 = $.sibling(div, 2);

	NotificationPortal(node_10, {});
	$.template_effect(() => $.set_attribute(a_1, 'href', SOCIAL_LINKS.GITHUB));
	$.bind_checked(input, () => $.get(isleftSidebarOpen), ($$value) => $.set(isleftSidebarOpen, $$value));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);