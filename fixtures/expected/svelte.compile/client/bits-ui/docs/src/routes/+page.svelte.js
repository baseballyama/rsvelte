import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "$lib/styles/app.css";
import { Button } from "bits-ui";
import Sparkle from "phosphor-svelte/lib/Sparkle";
import CardAir from "$lib/components/homepage/card-air.svelte";
import CardSound from "$lib/components/homepage/card-sound.svelte";
import CardTimer from "$lib/components/homepage/card-timer.svelte";
import CardToggle from "$lib/components/homepage/card-toggle.svelte";
import { Logo } from "$icons/index.js";
import LightSwitch from "$lib/components/light-switch.svelte";
import Customizable from "$lib/components/homepage/svg-customizable.svelte";
import Accessible from "$lib/components/homepage/svg-accessible.svelte";
import AccessibleDark from "$lib/components/homepage/svg-accessible-dark.svelte";
import Consistent from "$lib/components/homepage/svg-consistent.svelte";
import { goto } from "$app/navigation";
import Search from "$lib/components/search.svelte";

var root = $.from_html(`<meta name="description" content="Headless components for Svelte - flexible, unstyled, and accessible primitives that provide the foundation for building your own high-quality component library."/>`);
var root_1 = $.from_html(`<kbd class="bg-background-alt text-xxs pointer-events-none flex h-5 select-none items-center gap-1 rounded-sm border px-1.5 font-mono font-medium opacity-100 shadow-[0px_2px_0px_0px_#59595b] dark:border-[rgba(0,_0,_0,_0.10)] dark:bg-white dark:shadow-[0px_2px_0px_0px_#B8B8B8]"><span class="text-foreground-alt text-xs">S</span></kbd> <span class="text-background ml-4 mr-3 text-[14px] font-semibold leading-none tracking-[0.01em]">Start building</span>`, 1);

var root_2 = $.from_html(
	`<div class="border-b border-solid border-black/10 bg-white dark:border-white/20 dark:bg-[#171717]"><header class="flex items-center justify-between px-3 py-[17px] lg:grid lg:grid-cols-3 lg:px-5"><a href="/" class="focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden ml-2 mt-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2" aria-label="Home"><!></a> <!> <nav class="mt-2 flex items-center text-center lg:block"><ul><li class="inline-block"><a data-active="" href="/" class=" data-active:text-foreground data-active:bg-black/5 dark:data-active:bg-white/10 dark:data-active:text-white/100 rounded-[40px] px-[0.9em] pb-[0.4em] pt-[0.3em] text-sm font-medium leading-none tracking-[0.01em] dark:text-white/50">Home</a></li> <li class="inline-block"><a href="/docs" class="data-active:text-foreground data-active:bg-black/5 dark:data-active:bg-white/10 dark:data-active:text-white/100 rounded-[40px] px-[0.9em] pb-[0.4em] pt-[0.3em] text-sm font-medium leading-none tracking-[0.01em] transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10">Docs</a></li> <li class="inline-block"><a href="https://github.com/huntabyte/bits-ui" target="_blank" class="data-active:text-foreground data-active:bg-black/5 dark:data-active:bg-white/10 dark:data-active:text-white/100 rounded-[40px] px-[0.9em] pb-[0.4em] pt-[0.3em] text-sm font-medium leading-none tracking-[0.01em] transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10">GitHub</a></li></ul> <div class="relative top-[1px] block lg:hidden"><!></div></nav> <div class="hidden justify-end gap-3 lg:flex"><!> <!></div></header> <section class="desktop:max-h-[900px] flex flex-col justify-between overflow-hidden pt-20 lg:pt-[7em]"><div class="mx-7 text-center lg:mx-auto lg:w-7/12"><a href="https://github.com/huntabyte/bits-ui/releases" target="_blank" class="rounded-card-lg border-border-input shadow-mini inline-flex gap-2 border bg-white py-1.5 pl-3 pr-4 dark:border-[#F4F4F5]/20 dark:bg-[#242429]"><!> <span class="border-l-border-input text-foreground inline-block border-l pl-3 text-[11px] font-medium lg:text-[13px]">Bits UI v2 Now Available</span></a> <h1 class="selection:text-foreground dark:selection:text-background font-display dark:text-[#EAEAEA]! mx-auto mb-[0.35em] mt-[0.2em] text-balance pb-[0.1em] text-[2.875rem] font-semibold leading-[102%] text-transparent antialiased lg:max-w-3xl lg:text-[4.25rem] svelte-18thta0">The headless components for Svelte</h1> <p class="text-foreground/60 dark:text-foreground/50 mx-auto mb-[2em] max-w-sm text-[0.9rem] font-medium leading-[144%] sm:max-w-2xl md:w-9/12 md:max-w-2xl md:text-[1.125rem]">Flexible, unstyled, and accessible primitives that provide the foundation for
				building your own high-quality component library.</p> <!></div> <div class="mx-2.5 mt-24 grid grid-cols-2 gap-0 sm:mx-auto sm:w-[500px] sm:max-w-[500px] lg:w-[unset] lg:max-w-[unset] lg:grid-cols-[1fr_repeat(4,259px)_1fr]"><div class="relative hidden lg:order-1 lg:block"><div class="square dark:after:hidden! block dark:hidden svelte-18thta0"></div> <div class="dark_square after:hidden! dark:after:inline-block! hidden dark:block svelte-18thta0"></div></div> <!> <!> <!> <!> <div class="relative hidden lg:order-6 lg:block"><div class="circle dark:after:hidden! block dark:hidden svelte-18thta0"></div> <div class="dark_circle after:hidden! dark:after:inline-block! hidden dark:block svelte-18thta0"></div></div></div></section></div> <section class="mx-2.5 mb-20 mt-11 sm:mx-auto sm:max-w-[500px] lg:mb-40 lg:mt-24 lg:w-10/12 lg:max-w-[1036px]"><h2 class="text-foreground mb-10 text-balance lg:w-1/3"><small class="border-foreground rounded-3xl border px-2 py-[3px] text-[13px] font-medium tracking-[0.01em]"><span class="bg-foreground/90 mr-2.5 inline-block h-[7px] w-[7px] rounded-full"></span>explore</small> <span class="font-display mt-2 block text-[28px] font-semibold leading-[118%] tracking-[0.02em] lg:text-[32px]">The foundation for your next web project</span></h2> <div class="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-x-[15px]"><div class="rounded-card-lg border-border shadow-card col-span-2 overflow-hidden border lg:col-span-1"><div class="dotted_bg rounded-15px bg-background mx-[7px] my-[9px] bg-[radial-gradient(#DEDEDE_1px,transparent_0)] dark:bg-[#1E1E22] dark:bg-[radial-gradient(#36363A_1px,transparent_0)] svelte-18thta0"><h3 class="text-foreground px-[14px] pt-4 text-base font-semibold leading-none -tracking-[0.01em] lg:pt-5 lg:text-[17px]">Customizable</h3> <div class="pb-10 pt-8 lg:pb-16 lg:pt-9"><div class="aspect-354/259 relative mx-auto w-10/12 overflow-hidden bg-transparent lg:left-12 lg:ml-auto lg:w-full"><!></div></div> <div class="text-muted-foreground px-[14px] pb-4 text-[11px] font-medium lg:text-sm">Freedom with foundation.</div></div></div> <div class="rounded-card-lg border-border shadow-card dark:bg-muted overflow-hidden border bg-[#F8F8F8]"><div class="bg-transparent px-[7px] py-[9px]"><h3 class="text-foreground px-[14px] pt-4 text-base font-semibold leading-none -tracking-[0.01em] lg:pt-5 lg:text-[17px]">Accessible</h3> <div class="pb-5 pt-8 lg:pb-16 lg:pt-9"><div class="aspect-186/150 lg:aspect-354/259 relative left-[30px] w-full overflow-hidden bg-transparent lg:left-14"><!> <!></div></div> <div class="text-muted-foreground px-[14px] pb-2 text-[11px] font-medium lg:pb-4 lg:text-sm">Built for everyone, by default.</div></div></div> <div class="rounded-card-lg shadow-card overflow-hidden border border-white bg-[#2A2A2E] dark:border-[#F4F4F5]/10 dark:bg-[#3A3C42]"><div class="bg-transparent px-[7px] py-[9px]"><h3 class="text-background dark:text-foreground px-[14px] pt-4 text-base font-semibold leading-none -tracking-[0.01em] lg:pt-5 lg:text-[17px]">Unified</h3> <div class="pb-5 pt-8 lg:pb-16 lg:pt-9"><div class="aspect-186/150 lg:aspect-354/259 relative left-6 w-full overflow-hidden bg-transparent lg:left-[50px]"><!></div></div> <div class="px-[14px] pb-2 text-[11px] font-medium text-white/40 lg:pb-4 lg:text-sm dark:text-[#B0B0B3]">Predictable patterns, powerful results.</div></div></div></div></section> <footer class="dark:border-foreground/10 flex justify-between border-t border-black/10 px-[22px] pb-10 pt-6"><div class="text-muted-foreground flex items-center gap-2 text-sm font-medium lg:gap-3"><span class="bg-foreground/20 block aspect-square h-3 w-3 rounded-full"></span>2026 Bits UI
		team</div> <ul class="flex items-center justify-end gap-3 lg:gap-[26px]"><li><a href="https://bits-ui.com/llms.txt" target="_blank" class="text-muted-foreground text-sm font-medium">LLMs</a></li> <li><a href="https://github.com/huntabyte/bits-ui" target="_blank" class="text-muted-foreground text-sm font-medium">GitHub</a></li> <li><a href="https://github.com/huntabyte/bits-ui/releases" target="_blank" class="text-muted-foreground text-sm font-medium">Changelog</a></li></ul></footer>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let searchOpen = $.state(false);
	var fragment = root_2();

	$.event('keydown', $.window, (e) => {
		if ($.get(searchOpen)) return;

		if (e.key === "s" && !(e.metaKey || e.ctrlKey || e.altKey || e.shiftKey)) {
			goto("/docs");
		}
	});

	$.head('18thta0', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Bits UI – Headless components for Svelte';
		});

		$.append($$anchor, meta);
	});

	var div = $.first_child(fragment);
	var header = $.child(div);
	var a = $.child(header);
	var node = $.child(a);

	Logo(node, {});
	$.reset(a);

	var node_1 = $.sibling(a, 2);

	Search(node_1, {
		showTrigger: false,
		get open() {
			return $.get(searchOpen);
		},

		set open($$value) {
			$.set(searchOpen, $$value, true);
		}
	});

	var nav = $.sibling(node_1, 2);
	var div_1 = $.sibling($.child(nav), 2);
	var node_2 = $.child(div_1);

	LightSwitch(node_2, {});
	$.reset(div_1);
	$.reset(nav);

	var div_2 = $.sibling(nav, 2);
	var node_3 = $.child(div_2);

	LightSwitch(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Button.Root, ($$anchor, Button_Root) => {
		Button_Root($$anchor, {
			class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex\n        h-10 items-center justify-center px-5 text-[14px]\n        font-semibold active:scale-[0.98] active:transition-all',
			href: '/docs',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Get started');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(header);

	var section = $.sibling(header, 2);
	var div_3 = $.child(section);
	var a_1 = $.child(div_3);
	var node_5 = $.child(a_1);

	Sparkle(node_5, { class: 'mt-[2px] size-3 lg:size-4', 'aria-label': 'Stars' });
	$.next(2);
	$.reset(a_1);

	var node_6 = $.sibling(a_1, 6);

	$.component(node_6, () => Button.Root, ($$anchor, Button_Root_1) => {
		Button_Root_1($$anchor, {
			class: 'rounded-input bg-dark shadow-mini hover:bg-dark/95 inline-flex h-10\n        items-center justify-center\n        px-3 active:scale-[0.98] active:transition-all dark:bg-white',
			href: '/docs',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_7 = $.sibling($.child(div_4), 2);

	CardSound(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	CardAir(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	CardToggle(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	CardTimer(node_10, {});
	$.next(2);
	$.reset(div_4);
	$.reset(section);
	$.reset(div);

	var section_1 = $.sibling(div, 2);
	var div_5 = $.sibling($.child(section_1), 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var div_8 = $.sibling($.child(div_7), 2);
	var div_9 = $.child(div_8);
	var node_11 = $.child(div_9);

	Customizable(node_11, {});
	$.reset(div_9);
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);
	$.reset(div_6);

	var div_10 = $.sibling(div_6, 2);
	var div_11 = $.child(div_10);
	var div_12 = $.sibling($.child(div_11), 2);
	var div_13 = $.child(div_12);
	var node_12 = $.child(div_13);

	Accessible(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	AccessibleDark(node_13, {});
	$.reset(div_13);
	$.reset(div_12);
	$.next(2);
	$.reset(div_11);
	$.reset(div_10);

	var div_14 = $.sibling(div_10, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.sibling($.child(div_15), 2);
	var div_17 = $.child(div_16);
	var node_14 = $.child(div_17);

	Consistent(node_14, {});
	$.reset(div_17);
	$.reset(div_16);
	$.next(2);
	$.reset(div_15);
	$.reset(div_14);
	$.reset(div_5);
	$.reset(section_1);
	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}