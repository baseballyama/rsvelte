import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { ProgressiveBlur } from "$lib/components/magic/progressive-blur";
import { cn } from "$lib/utils";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import { scrollY } from "svelte/reactivity/window";
import { Marquee } from "$lib/components/magic/marquee";

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
var root_1 = $.from_html(`<header><nav class="fixed z-20 w-full border-b bg-background/50 backdrop-blur-3xl"><div class="mx-auto max-w-5xl px-6 transition-all duration-300"><div class="flex flex-wrap items-center justify-between gap-6 py-3 lg:flex-nowrap lg:gap-6 lg:py-4"><div class="flex w-full items-center justify-between lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div><div class="lg:pr-4"><ul class="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit"><!> <!></div></div></div></div></nav></header>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<!> <main class="overflow-x-hidden"><section><div class="pt-12 pb-24 md:pb-32 lg:pt-44 lg:pb-56"><div class="relative mx-auto flex max-w-6xl flex-col px-6 lg:block"><div class="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left"><h1 class="mt-8 max-w-2xl text-5xl font-medium text-balance md:text-6xl lg:mt-16 xl:text-7xl">Ship 10x Faster with NS</h1> <p class="mt-8 max-w-2xl text-lg text-pretty">Highly customizable components for building modern websites and applications
						that look and feel the way you mean it.</p> <div class="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start"><!> <!></div></div></div></div></section> <section class="border-t bg-background pt-4 pb-16 md:pb-32"><div class="group relative m-auto max-w-6xl px-6"><div class="flex flex-col items-center md:flex-row"><div class="md:max-w-44 md:border-r md:pr-6"><p class="text-end text-sm">Powering the best teams</p></div> <div class="relative py-6 **:fill-foreground md:w-[calc(100%-11rem)]"><!> <div class="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background"></div> <div class="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background"></div> <!> <!></div></div></div></section></main>`,
	1
);

export default function Hero_four($$anchor, $$props) {
	$.push($$props, true);

	const // Hero Header Component
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

				var text_1 = $.text('Login');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});

		var node_3 = $.sibling(node_2, 2);

		Button(node_3, {
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Sign Up');

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
				"mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 sm:justify-between md:flex-nowrap lg:m-0 lg:flex  lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
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

	const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };
	var $$exports = { GRADIENT_ANGLES };
	var fragment = root_3();
	var node_4 = $.first_child(fragment);

	header(node_4);

	var main = $.sibling(node_4, 2);
	var section = $.child(main);
	var div_6 = $.child(section);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var div_9 = $.sibling($.child(div_8), 4);
	var node_5 = $.child(div_9);

	Button(node_5, {
		href: '/',
		size: 'lg',
		class: 'px-5 text-base',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Start Building');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		size: 'lg',
		variant: 'ghost',
		class: 'px-5 text-base',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Request a demo');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_10 = $.child(section_1);
	var div_11 = $.child(div_10);
	var div_12 = $.sibling($.child(div_11), 2);
	var node_7 = $.child(div_12);

	Marquee(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_8 = $.first_child(fragment_1);

			Bolt(node_8, { height: 22, width: 56 });

			var node_9 = $.sibling(node_8, 2);

			VercelFull(node_9, { height: 22, width: 84 });

			var node_10 = $.sibling(node_9, 2);

			SupabaseFull(node_10, { class: 'h-6' });

			var node_11 = $.sibling(node_10, 2);

			Hulu(node_11, { height: 18, width: 56 });

			var node_12 = $.sibling(node_11, 2);

			Spotify(node_12, { height: 24, width: 80 });

			var node_13 = $.sibling(node_12, 2);

			FirebaseFull(node_13, { height: 24, width: 80 });

			var node_14 = $.sibling(node_13, 2);

			Beacon(node_14, { height: 24, width: 80 });

			var node_15 = $.sibling(node_14, 2);

			Claude(node_15, { height: 26, width: 90 });

			var node_16 = $.sibling(node_15, 2);

			Figma(node_16, { height: 24, width: 24 });

			var node_17 = $.sibling(node_16, 2);

			Cisco(node_17, { height: 30, width: 60 });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div_13 = $.sibling(node_7, 2);

	$.set_attribute(div_13, 'aria-hidden', true);

	var div_14 = $.sibling(div_13, 2);

	$.set_attribute(div_14, 'aria-hidden', true);

	var node_18 = $.sibling(div_14, 2);

	ProgressiveBlur(node_18, {
		direction: 'left',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 left-0 h-full w-20'
	});

	var node_19 = $.sibling(node_18, 2);

	ProgressiveBlur(node_19, {
		direction: 'right',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 right-0 h-full w-20'
	});

	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_10);
	$.reset(section_1);
	$.reset(main);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);