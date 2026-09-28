import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import AuthCarousel from '$lib/components/auth/auth-carousel.svelte';
import Skeleton from '$lib/components/branding/skeleton.svelte';

var root = $.from_html(`<div class="grid min-h-screen grid-cols-1 lg:grid-cols-2"><section class="preset-filled-surface-100-900 flex flex-col p-6 lg:p-10"><a href="/" class="inline-flex items-center gap-2 self-start" aria-label="Homepage" title="Homepage"><!> <span class="text-sm font-medium">Skeleton Plus</span></a> <div class="flex flex-1 items-center justify-center"><div class="w-full max-w-sm"><!></div></div> <footer class="flex items-center justify-between text-xs opacity-60"><p>By <a href="https://www.skeletonlabs.co/" target="_blank" class="hover:underline">Skeleton Labs</a></p> <nav class="flex items-center gap-2"><a class="hover:underline">Terms</a> <span class="opacity-60" aria-hidden="true">&bull;</span> <a class="hover:underline">Privacy</a></nav></footer></section> <aside class="preset-filled-surface-50-950 relative hidden flex-col justify-center items-center p-10 lg:flex"><!></aside></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var section = $.child(div);
	var a = $.child(section);
	var node = $.child(a);

	Skeleton(node, { class: 'size-elem-3xl' });
	$.next(2);
	$.reset(a);

	var div_1 = $.sibling(a, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_2);
	$.reset(div_1);

	var footer = $.sibling(div_1, 2);
	var nav = $.sibling($.child(footer), 2);
	var a_1 = $.child(nav);
	var a_2 = $.sibling(a_1, 4);

	$.reset(nav);
	$.reset(footer);
	$.reset(section);

	var aside = $.sibling(section, 2);
	var node_2 = $.child(aside);

	AuthCarousel(node_2, {});
	$.reset(aside);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a_1, 'href', $0);
			$.set_attribute(a_2, 'href', $1);
		},
		[
			() => resolve('/legal/terms'),
			() => resolve('/legal/privacy')
		]
	);

	$.append($$anchor, div);
	$.pop();
}