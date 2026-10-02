import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DecorCorners from '$lib/components/layout/decor-corners.svelte';
import DecorStripes from '$lib/components/layout/decor-stripes.svelte';
import ThemesMarquee from '$lib/components/marquee/themes-marquee.svelte';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import BlocksIcon from '@lucide/svelte/icons/blocks';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import LayersIcon from '@lucide/svelte/icons/layers';
import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
import PaintbrushIcon from '@lucide/svelte/icons/paintbrush';
import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
import UsersIcon from '@lucide/svelte/icons/users';

var root = $.from_html(`<div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors"><!> <div><p class="text-xl font-semibold">Design Tools</p> <p class="text-xs opacity-60">Create themes, presets, and meshes.</p></div></div> <div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors"><!> <div><p class="text-xl font-semibold">Resources</p> <p class="text-xs opacity-60">Get blocks, templates, and more.</p></div></div> <div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors"><!> <div><p class="text-xl font-semibold">Community</p> <p class="text-xs opacity-60">Powerful tools from the community.</p></div></div>`, 1);

var root_1 = $.from_html(
	`<section><div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-200-800"><div class="container-cell p-10! lg:p-20! gap-4"><p class="text-sm font-semibold uppercase tracking-widest opacity-60">Skeleton Plus</p> <h1 class="font-bold text-4xl lg:text-7xl text-balance max-w-2xl">Supercharge your Skeleton apps.</h1></div> <div class="container-cell p-10! lg:p-20! flex flex-col justify-center items-start gap-4"><p class="opacity-60"><strong>Skeleton Plus</strong> features a collection of design tools, resources, and community offerings. Purpose built for use with the
				Skeleton open source library.</p> <div class="flex flex-wrap gap-3"><a href="https://www.skeleton.dev/" target="_blank" class="btn lg:btn-lg preset-outlined"><span>Skeleton</span> <!></a> <a href="/content/blocks" class="btn lg:btn-lg preset-filled"><span>Get Started</span> <!></a></div></div></div></section> <!> <!> <!> <section class="border-b border-surface-200-800 bg-linear-to-b from-transparent to-(--color-surface-50-950)"><header class="container-cell lg:pt-20! max-w-6xl mx-auto space-y-4"><div class="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-4"><header class="space-y-2"><h2 class="h2">Themes Repository.</h2> <p class="opacity-60">Explore and download themes crafted by the Skeleton community. No account needed.</p></header>  <button type="button" class="btn preset-outlined" disabled="">Coming Soon!</button></div></header> <!></section> <section class="container-page lg:py-20! border-b border-surface-200-800"><header class="text-center space-y-2"><h2 class="h2">Everything at a glance.</h2> <p class="opacity-60">Tools, templates, and resources to help you ship polished Skeleton apps faster.</p></header> <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">Design Tools</h3> <p class="opacity-60">Powerful tools for creating themes, presets, and mesh gradients for your applications.</p></div> <div class="grid grid-cols-2 gap-2"><a href="/design/themes" class="btn preset-tonal">Themes</a> <a href="/design/presets" class="btn preset-tonal">Presets</a></div></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">Blocks</h3> <p class="opacity-60">A growing library of complex, production-ready page sections to extend your UI.</p></div> <a href="/content/blocks" class="btn preset-tonal">Browse Blocks</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">Templates</h3> <p class="opacity-60">Curated, full website templates built on Skeleton. The perfect starting point for your next project.</p></div> <a href="/content/templates" class="btn preset-tonal">Browse Themes</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">Tutorials</h3> <p class="opacity-60">Step-by-step guides covering fundamentals and advanced integration patterns.</p></div> <a href="/content/tutorials" class="btn preset-tonal">Browse Tutorials</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">UI Kit</h3> <p class="opacity-60">Figma assets that compliment Skeleton's design system. Design and code in perfect sync.</p></div> <a href="/content/community/etesie" class="btn preset-tonal">Browse UI Kit</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center"><!></div> <div class="space-y-2 flex-1"><h3 class="h4">Community</h3> <p class="opacity-60">A collection of community maintained tools aimed at designers and developers.</p></div> <a href="/content/community" class="btn preset-tonal">Browse Community</a></div></div></section>`,
	1
);

export default function _page($$anchor) {
	var fragment = root_1();
	var section = $.first_child(fragment);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var a = $.child(div_2);
	var node = $.sibling($.child(a), 2);

	ArrowUpRightIcon(node, {});
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_1 = $.sibling($.child(a_1), 2);

	ArrowRightIcon(node_1, {});
	$.reset(a_1);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);

	var node_2 = $.sibling(section, 2);

	DecorStripes(node_2, { class: 'h-6' });

	var node_3 = $.sibling(node_2, 2);

	DecorCorners(node_3, {
		corners: ['tl', 'tr', 'bl', 'br'],
		class: 'grid grid-cols-1 md:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-200-800 border-t border-b border-surface-200-800',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div_3 = $.first_child(fragment_1);
			var node_4 = $.child(div_3);

			PaintbrushIcon(node_4, { class: 'size-elem-3xl stroke-primary-500' });
			$.next(2);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_5 = $.child(div_4);

			BlocksIcon(node_5, { class: 'size-elem-3xl stroke-secondary-500' });
			$.next(2);
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_6 = $.child(div_5);

			UsersIcon(node_6, { class: 'size-elem-3xl stroke-tertiary-500' });
			$.next(2);
			$.reset(div_5);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 2);

	DecorStripes(node_7, { class: 'h-6' });

	var section_1 = $.sibling(node_7, 2);
	var node_8 = $.sibling($.child(section_1), 2);

	ThemesMarquee(node_8, {});
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_6 = $.sibling($.child(section_2), 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var node_9 = $.child(div_8);

	SlidersHorizontalIcon(node_9, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_8);
	$.next(4);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	var node_10 = $.child(div_10);

	BlocksIcon(node_10, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_10);
	$.next(4);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var div_12 = $.child(div_11);
	var node_11 = $.child(div_12);

	LayoutTemplateIcon(node_11, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_12);
	$.next(4);
	$.reset(div_11);

	var div_13 = $.sibling(div_11, 2);
	var div_14 = $.child(div_13);
	var node_12 = $.child(div_14);

	GraduationCapIcon(node_12, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_14);
	$.next(4);
	$.reset(div_13);

	var div_15 = $.sibling(div_13, 2);
	var div_16 = $.child(div_15);
	var node_13 = $.child(div_16);

	LayersIcon(node_13, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_16);
	$.next(4);
	$.reset(div_15);

	var div_17 = $.sibling(div_15, 2);
	var div_18 = $.child(div_17);
	var node_14 = $.child(div_18);

	UsersIcon(node_14, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$.reset(div_18);
	$.next(4);
	$.reset(div_17);
	$.reset(div_6);
	$.reset(section_2);
	$.append($$anchor, fragment);
}