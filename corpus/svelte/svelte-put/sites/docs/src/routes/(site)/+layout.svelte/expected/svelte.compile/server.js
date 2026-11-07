import * as $ from 'svelte/internal/server';
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

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children } = $$props;

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

		let isleftSidebarOpen = false;

		function closeLeftSidebar() {
			isleftSidebarOpen = false;
		}

		let hydrated = false;
		const { stack } = NotificationContext.set();

		onMount(() => {
			hydrated = true;

			const url = $.store_get($$store_subs ??= {}, '$page', page).url;

			if (url.searchParams.has('color-scheme')) {
				url.searchParams.delete('color-scheme');
				goto(url, { replaceState: true });
			}

			if (!localStorage.getItem('skip-svelte-5-notification')) {
				stack.push('custom', { component: Svelte5, timeout: 10_000 });
			}
		});

		if ($.store_get($$store_subs ??= {}, '$navigating', navigating)) {
			$$renderer.push('<!--[0-->');
			PageLoadIndicator($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="pt-header relative flex w-full flex-1 flex-col svelte-lp2mpd" id="docs"><header class="z-header h-header border-outline fixed inset-x-0 top-0 flex flex-col border-b svelte-lp2mpd"><nav class="max-w-pad flex flex-1 items-center py-2" aria-label="header"><a href="/" class="mr-auto flex items-center gap-2"><svg class="h-8 w-8 shrink-0" inline-src="svelte-put" width="32" height="32"></svg> <span class="font-fingerpaint text-gradient-brand text-sm font-bold">svelte-put</span></a> `);

		if (hydrated) {
			$$renderer.push(`<!--[0--><a class="c-btn c-btn--outlined gap-2 py-1.5 pl-3 pr-4" href="/search"><i class="i i-[magnifying-glass] h-5 w-5"></i> <span class="text-sm">Search...</span></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ColorSchemeMenu($$renderer, { class: 'ml-5' });
		$$renderer.push(`<!----> <a${$.attr('href', SOCIAL_LINKS.GITHUB)} data-external="" class="c-link-icon ml-5"><svg inline-src="simpleicon/github" height="28" width="28"></svg> <span class="sr-only">Github</span></a></nav> <div class="max-w-pad border-outline desktop:justify-end widescreen:hidden flex flex-1 items-center justify-between border-t py-1">`);

		MenuLabel($$renderer, {
			class: 'desktop:hidden',
			for: 'pages-toggler',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Navigation`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		MenuLabel($$renderer, {
			align: 'right',
			for: 'toc-toggler',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Table of Contents`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></header> <div class="max-w-pad flex items-stretch"><nav class="sidebar sidebar-left svelte-lp2mpd" aria-label="pages"><input id="pages-toggler" type="checkbox" hidden=""${$.attr('checked', isleftSidebarOpen, true)} class="svelte-lp2mpd"/> <ul class="sidebar-content space-y-4 text-sm svelte-lp2mpd"><li><p class="font-bold uppercase">Overview</p> <ul class="border-outline mt-3 space-y-1 border-l"><li><!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(TOP_LEVEL_PATHS));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [label, path] = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', path)}${$.attr('data-current', data.pathname === path)} class="c-link-lazy current:border-link current:text-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3">${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--></li></ul></li> <li><p class="font-bold uppercase">Packages</p> <ul class="border-outline mt-3 space-y-1 border-l"><!--[-->`);

		const each_array_1 = $.ensure_array_like(data.packages.active);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { id, status } = each_array_1[$$index_1];

			$$renderer.push(`<li><a${$.attr('href', `/docs/${$.stringify(id)}`)}${$.attr('data-current', data.pathname.includes(`/${id}`))} class="current:text-link c-link-lazy current:border-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3"><span class="bg-primary h-full w-1"></span> ${$.escape(id)} <sup>`);

			if (status !== 'stable' && status !== 'deprecated') {
				$$renderer.push('<!--[0-->');
				StatusBadge($$renderer, { status });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></sup></a></li>`);
		}

		$$renderer.push(`<!--]--> <li class="pt-4"><p class="border-t pl-3 pt-4 font-bold uppercase">Deprecated</p> <ul class="mt-3"><!--[-->`);

		const each_array_2 = $.ensure_array_like(data.packages.deprecated);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { id } = each_array_2[$$index_2];

			$$renderer.push(`<li><a${$.attr('href', `/docs/${$.stringify(id)}`)}${$.attr('data-current', data.pathname.includes(`/${id}`))} class="current:text-link c-link-lazy current:border-link -ml-px block whitespace-nowrap border-l border-transparent py-1 pl-3"><span class="bg-primary h-full w-1"></span> ${$.escape(id)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li></ul></li></ul></nav> <label class="sidebar-backdrop svelte-lp2mpd" for="pages-toggler"></label> <!---->`);

		{
			$$renderer.push(`<main class="prose dark:prose-invert svelte-lp2mpd">`);
			children($$renderer);
			$$renderer.push(`<!----></main>`);
		}

		$$renderer.push(`<!----> <nav class="sidebar sidebar-right svelte-lp2mpd" aria-label="table of contents"><p class="c-callout c-callout--success c-callout--icon-megaphone upto-widescreen:hidden mt-10">Still on Svelte 4? See <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old docs site here.</a></p> <div class="sveltevietnam-banner upto-widescreen:hidden mt-5 space-y-2 rounded border p-4"><p class="font-medium">Are you based in Vietnam?</p> <div class="flex items-center gap-4"><div class="i i-sveltename h-10 w-10 shrink-0"></div> <p>Join the <a class="c-link" href="https://www.sveltevietnam.dev">Svelte Vietnam</a> community.</p></div></div> <input id="toc-toggler" type="checkbox" hidden="" class="svelte-lp2mpd"/> <div class="sidebar-content text-sm svelte-lp2mpd">`);

		if (toc.items.size) {
			$$renderer.push(`<!--[0--><p class="py-2 font-bold uppercase">On This Page</p> <ul class="border-outline space-y-1 border-l"><!--[-->`);

			const each_array_3 = $.ensure_array_like(toc.items.values());

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let tocItem = each_array_3[$$index_3];
				const level = tocItem.element.tagName.slice(1);

				$$renderer.push(`<li><a class="c-link-lazy current:border-link current:text-link -ml-px block border-l border-transparent py-1 capitalize"${$.attr_style('', { 'padding-left': `calc((${$.stringify(level)} - 1) * 2ch)` })}></a></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></nav></div></div> `);
		NotificationPortal($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}