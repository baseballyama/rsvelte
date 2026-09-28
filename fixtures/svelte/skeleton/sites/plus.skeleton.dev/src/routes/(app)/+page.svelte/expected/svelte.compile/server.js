import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer) {
	$$renderer.push(`<section><div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-200-800"><div class="container-cell p-10! lg:p-20! gap-4"><p class="text-sm font-semibold uppercase tracking-widest opacity-60">Skeleton Plus</p> <h1 class="font-bold text-4xl lg:text-7xl text-balance max-w-2xl">Supercharge your Skeleton apps.</h1></div> <div class="container-cell p-10! lg:p-20! flex flex-col justify-center items-start gap-4"><p class="opacity-60"><strong>Skeleton Plus</strong> features a collection of design tools, resources, and community offerings. Purpose built for use with the
				Skeleton open source library.</p> <div class="flex flex-wrap gap-3"><a href="https://www.skeleton.dev/" target="_blank" class="btn lg:btn-lg preset-outlined"><span>Skeleton</span> `);

	ArrowUpRightIcon($$renderer, {});
	$$renderer.push(`<!----></a> <a href="/content/blocks" class="btn lg:btn-lg preset-filled"><span>Get Started</span> `);
	ArrowRightIcon($$renderer, {});
	$$renderer.push(`<!----></a></div></div></div></section> `);
	DecorStripes($$renderer, { class: 'h-6' });
	$$renderer.push(`<!----> `);

	DecorCorners($$renderer, {
		corners: ['tl', 'tr', 'bl', 'br'],
		class: 'grid grid-cols-1 md:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-200-800 border-t border-b border-surface-200-800',
		children: ($$renderer) => {
			$$renderer.push(`<div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors">`);
			PaintbrushIcon($$renderer, { class: 'size-elem-3xl stroke-primary-500' });
			$$renderer.push(`<!----> <div><p class="text-xl font-semibold">Design Tools</p> <p class="text-xs opacity-60">Create themes, presets, and meshes.</p></div></div> <div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors">`);
			BlocksIcon($$renderer, { class: 'size-elem-3xl stroke-secondary-500' });
			$$renderer.push(`<!----> <div><p class="text-xl font-semibold">Resources</p> <p class="text-xs opacity-60">Get blocks, templates, and more.</p></div></div> <div class="container-cell p-4 flex justify-center items-center gap-3 transition-colors">`);
			UsersIcon($$renderer, { class: 'size-elem-3xl stroke-tertiary-500' });
			$$renderer.push(`<!----> <div><p class="text-xl font-semibold">Community</p> <p class="text-xs opacity-60">Powerful tools from the community.</p></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	DecorStripes($$renderer, { class: 'h-6' });
	$$renderer.push(`<!----> <section class="border-b border-surface-200-800 bg-linear-to-b from-transparent to-(--color-surface-50-950)"><header class="container-cell lg:pt-20! max-w-6xl mx-auto space-y-4"><div class="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-4"><header class="space-y-2"><h2 class="h2">Themes Repository.</h2> <p class="opacity-60">Explore and download themes crafted by the Skeleton community. No account needed.</p></header>  <button type="button" class="btn preset-outlined" disabled="">Coming Soon!</button></div></header> `);
	ThemesMarquee($$renderer, {});
	$$renderer.push(`<!----></section> <section class="container-page lg:py-20! border-b border-surface-200-800"><header class="text-center space-y-2"><h2 class="h2">Everything at a glance.</h2> <p class="opacity-60">Tools, templates, and resources to help you ship polished Skeleton apps faster.</p></header> <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	SlidersHorizontalIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">Design Tools</h3> <p class="opacity-60">Powerful tools for creating themes, presets, and mesh gradients for your applications.</p></div> <div class="grid grid-cols-2 gap-2"><a href="/design/themes" class="btn preset-tonal">Themes</a> <a href="/design/presets" class="btn preset-tonal">Presets</a></div></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	BlocksIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">Blocks</h3> <p class="opacity-60">A growing library of complex, production-ready page sections to extend your UI.</p></div> <a href="/content/blocks" class="btn preset-tonal">Browse Blocks</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	LayoutTemplateIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">Templates</h3> <p class="opacity-60">Curated, full website templates built on Skeleton. The perfect starting point for your next project.</p></div> <a href="/content/templates" class="btn preset-tonal">Browse Themes</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	GraduationCapIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">Tutorials</h3> <p class="opacity-60">Step-by-step guides covering fundamentals and advanced integration patterns.</p></div> <a href="/content/tutorials" class="btn preset-tonal">Browse Tutorials</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	LayersIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">UI Kit</h3> <p class="opacity-60">Figma assets that compliment Skeleton's design system. Design and code in perfect sync.</p></div> <a href="/content/community/etesie" class="btn preset-tonal">Browse UI Kit</a></div> <div class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4 flex flex-col"><div class="flex justify-center">`);
	UsersIcon($$renderer, { class: 'size-elem-9xl stroke-[0.5px] opacity-40' });
	$$renderer.push(`<!----></div> <div class="space-y-2 flex-1"><h3 class="h4">Community</h3> <p class="opacity-60">A collection of community maintained tools aimed at designers and developers.</p></div> <a href="/content/community" class="btn preset-tonal">Browse Community</a></div></div></section>`);
}