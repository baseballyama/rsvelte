import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Skeleton from '$lib/components/branding/skeleton.svelte';
import Footer from '$lib/components/layout/footer.svelte';
import Header from '$lib/components/layout/header.svelte';
import HomeIcon from '@lucide/svelte/icons/home';
import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

var root = $.from_html(`<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]"><!> <main class="container container-page mx-auto flex w-full items-center justify-center border-x border-surface-200-800"><article class="w-full max-w-xl flex flex-col justify-center items-center gap-4"><header><!> <h1 class="sr-only">Error</h1></header> <article class="space-y-2 text-center"><p class="opacity-60"> </p> <h2 class="h3"> </h2></article> <footer class="flex gap-2"><a class="btn preset-outlined-surface-200-800"><!> <span>Reload Page</span></a> <a href="/" class="btn preset-filled"><!> <span>Go Home</span></a></footer></article></main> <!></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Header(node, {});

	var main = $.sibling(node, 2);
	var article = $.child(main);
	var header = $.child(article);
	var node_1 = $.child(header);

	Skeleton(node_1, { class: 'size-elem-7xl' });
	$.next(2);
	$.reset(header);

	var article_1 = $.sibling(header, 2);
	var p = $.child(article_1);
	var text = $.only_child(p);
	var h2 = $.sibling(p, 2);
	var text_1 = $.only_child(h2, true);

	$.reset(article_1);

	var footer = $.sibling(article_1, 2);
	var a = $.child(footer);
	var node_2 = $.child(a);

	RefreshCwIcon(node_2, {});
	$.next(2);
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_3 = $.child(a_1);

	HomeIcon(node_3, {});
	$.next(2);
	$.reset(a_1);
	$.reset(footer);
	$.reset(article);
	$.reset(main);

	var node_4 = $.sibling(main, 2);

	Footer(node_4, {});
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, `Status ${page.status ?? ''}`);
			$.set_text(text_1, page.error?.message ?? 'An unknown error occurred.');
			$.set_attribute(a, 'href', $0);
		},
		[() => page.url.toString()]
	);

	$.append($$anchor, div);
	$.pop();
}