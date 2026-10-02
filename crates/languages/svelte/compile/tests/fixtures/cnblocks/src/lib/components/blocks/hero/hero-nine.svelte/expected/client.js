import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import { scrollY } from "svelte/reactivity/window";

import {
	Beacon,
	Bolt,
	Cisco,
	Claude,
	Figma,
	FirebaseFull,
	Hulu,
	Spotify,
	SupabaseFull,
	VercelFull
} from "$lib/svgs";

var root = $.from_html(`<li><a class="block text-muted-foreground duration-150 hover:text-accent-foreground"><span> </span></a></li>`);
var root_1 = $.from_html(`<header><nav class="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"><div class="m-auto max-w-5xl px-6"><div class="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4"><div class="flex w-full justify-between lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div><div class="lg:pr-4"><ul class="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6"><!> <!></div></div></div></div></nav></header>`);
var root_2 = $.from_html(`<span class="btn-label">Start Building</span>`);

var root_3 = $.from_html(`<div><!> <main><div class="absolute inset-0 isolate z-2 hidden opacity-50 contain-strict lg:block"><div class="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]"></div> <div class="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div> <div class="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div></div> <section class="overflow-hidden bg-white dark:bg-transparent"><div class="relative mx-auto max-w-5xl px-6 py-28 lg:py-24"><div class="relative z-10 mx-auto max-w-2xl text-center"><h1 class="text-4xl font-semibold text-balance md:text-5xl lg:text-6xl">Modern Software testing reimagined</h1> <p class="mx-auto my-8 max-w-2xl text-xl">Officiis laudantium excepturi ducimus rerum dignissimos, and tempora nam
						vitae, excepturi ducimus iste provident dolores.</p> <!></div></div> <div class="mx-auto -mt-16 max-w-7xl"><div class="-mr-16 pl-16 perspective-distant lg:-mr-56 lg:pl-56"><div class="[transform:rotateX(20deg);]"><div class="relative skew-x-[.36rad] lg:h-176"><div class="absolute -inset-16 z-1 bg-linear-to-b from-background via-transparent to-background sm:-inset-32"></div> <div class="absolute -inset-16 z-1 bg-white/50 bg-linear-to-r from-background via-transparent to-background sm:-inset-32 dark:bg-transparent"></div> <div class="absolute -inset-16 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] [--color-border:var(--color-zinc-400)] sm:-inset-32 dark:[--color-border:color-mix(in_oklab,var(--color-white)_20%,transparent)]"></div> <div class="absolute inset-0 z-11 bg-linear-to-l from-background"></div> <div class="absolute inset-0 z-2 size-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,var(--color-background)_100%)]"></div> <div class="absolute inset-0 z-2 size-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,var(--color-background)_100%)]"></div> <img class="relative z-1 rounded-(--radius) border dark:hidden" src="/card.png" alt="Tailark hero section"/> <img class="relative z-1 hidden rounded-(--radius) border dark:block" src="/dark-card.webp" alt="Tailark hero section"/></div></div></div></div></section> <section class="relative z-10 bg-muted/50 py-16 dark:bg-background"><div class="m-auto max-w-5xl px-6"><h2 class="text-center text-lg font-medium">Your favorite companies are our partners.</h2> <div class="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 **:fill-foreground sm:gap-x-16 sm:gap-y-12"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div></section></main></div>`);

export default function Hero_nine($$anchor, $$props) {
	$.push($$props, true);

	const // You can store Hero Header Component in seperate file
	// I have used snippet for better readability
	// Hero Header Component
	header = ($$anchor) => {
		var header_1 = root_1();
		var nav = $.child(header_1);
		var div = $.child(nav);
		var div_1 = $.child(div);
		var div_2 = $.child(div_1);
		var button = $.sibling($.child(div_2), 2);
		var node = $.child(button);

		{
			let $0 = $.derived(() => [
				"m-auto size-6 duration-200",
				$.get(menuState) && "scale-0 rotate-180 opacity-0"
			]);

			Menu(node, {
				get class() {
					return $.get($0);
				}
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			let $0 = $.derived(() => [
				"absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200",
				$.get(menuState) && "scale-100 rotate-0 opacity-100"
			]);

			X(node_1, {
				get class() {
					return $.get($0);
				}
			});
		}

		$.reset(button);
		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var div_4 = $.child(div_3);
		var ul = $.child(div_4);

		$.each(ul, 21, () => menuItems, $.index, ($$anchor, item) => {
			var li = root();
			var a = $.child(li);
			var span = $.child(a);
			var text = $.only_child(span, true);

			$.reset(a);
			$.reset(li);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $.get(item).href);
				$.set_text(text, $.get(item).name);
			});

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_4);

		var div_5 = $.sibling(div_4, 2);
		var node_2 = $.child(div_5);

		Button(node_2, {
			variant: 'outline',
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Sign Up');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});

		var node_3 = $.sibling(node_2, 2);

		Button(node_3, {
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Login');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		$.reset(div_5);
		$.reset(div_3);
		$.reset(div_1);
		$.reset(div);
		$.reset(nav);
		$.reset(header_1);

		$.template_effect(() => {
			$.set_attribute(button, 'aria-label', $.get(menuState) == true ? "Close Menu" : "Open Menu");

			$.set_class(div_3, 1, $.clsx([
				"mb-6  w-full  flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
				$.get(menuState) ? "block lg:flex" : "hidden"
			]));
		});

		$.delegated('click', button, () => $.set(menuState, !$.get(menuState)));
		$.append($$anchor, header_1);
	};

	let menuItems = [
		{ name: "Features", href: "#a" },
		{ name: "Solution", href: "#a" },
		{ name: "Pricing", href: "#a" },
		{ name: "About", href: "#a" }
	];

	let menuState = $.state(false);

	let isScrolled = $.derived(() => {
		if (scrollY.current !== undefined && scrollY.current > 50) {
			return true;
		}

		return false;
	});

	var div_6 = root_3();
	var node_4 = $.child(div_6);

	header(node_4);

	var main = $.sibling(node_4, 2);
	var div_7 = $.child(main);

	$.set_attribute(div_7, 'aria-hidden', true);

	var section = $.sibling(div_7, 2);
	var div_8 = $.child(section);
	var div_9 = $.child(div_8);
	var node_5 = $.sibling($.child(div_9), 4);

	Button(node_5, {
		href: '/',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			var span_1 = root_2();

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var div_14 = $.child(div_13);

	$.set_attribute(div_14, 'aria-hidden', true);

	var div_15 = $.sibling(div_14, 2);

	$.set_attribute(div_15, 'aria-hidden', true);

	var div_16 = $.sibling(div_15, 2);

	$.set_attribute(div_16, 'aria-hidden', true);

	var div_17 = $.sibling(div_16, 2);

	$.set_attribute(div_17, 'aria-hidden', true);

	var div_18 = $.sibling(div_17, 2);

	$.set_attribute(div_18, 'aria-hidden', true);

	var div_19 = $.sibling(div_18, 2);

	$.set_attribute(div_19, 'aria-hidden', true);

	var img = $.sibling(div_19, 2);

	$.set_attribute(img, 'width', 2880);
	$.set_attribute(img, 'height', 2074);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 2880);
	$.set_attribute(img_1, 'height', 2074);
	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_10);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_20 = $.child(section_1);
	var div_21 = $.sibling($.child(div_20), 2);
	var node_6 = $.child(div_21);

	Bolt(node_6, { height: 22, width: 56 });

	var node_7 = $.sibling(node_6, 2);

	VercelFull(node_7, { height: 22, width: 84 });

	var node_8 = $.sibling(node_7, 2);

	SupabaseFull(node_8, { class: 'h-6' });

	var node_9 = $.sibling(node_8, 2);

	Hulu(node_9, { height: 18, width: 56 });

	var node_10 = $.sibling(node_9, 2);

	Spotify(node_10, { height: 24, width: 80 });

	var node_11 = $.sibling(node_10, 2);

	FirebaseFull(node_11, { height: 24, width: 80 });

	var node_12 = $.sibling(node_11, 2);

	Beacon(node_12, { height: 24, width: 80 });

	var node_13 = $.sibling(node_12, 2);

	Claude(node_13, { height: 26, width: 90 });

	var node_14 = $.sibling(node_13, 2);

	Figma(node_14, { height: 24, width: 24 });

	var node_15 = $.sibling(node_14, 2);

	Cisco(node_15, { height: 30, width: 60 });
	$.reset(div_21);
	$.reset(div_20);
	$.reset(section_1);
	$.reset(main);
	$.reset(div_6);
	$.append($$anchor, div_6);
	$.pop();
}

$.delegate(['click']);