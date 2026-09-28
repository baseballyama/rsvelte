import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import Rocket from "@lucide/svelte/icons/rocket";
import ArrowRight from "@lucide/svelte/icons/arrow-right";

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
var root_2 = $.from_html(`<!> Start Building`, 1);

var root_3 = $.from_html(
	`<!> <main class="overflow-hidden"><section><div class="relative pt-24"><div class="mx-auto max-w-7xl px-6"><div class="max-w-3xl text-center sm:mx-auto lg:mt-0 lg:mr-auto lg:w-4/5"><a href="/" class="mx-auto flex w-fit items-center gap-2 rounded-(--radius) border p-1 pr-3"><span class="rounded-[calc(var(--radius)-0.25rem)] bg-muted px-2 py-1 text-xs">New</span> <span class="text-sm">Introduction Tailus UI Html</span> <span class="block h-4 w-px bg-(--color-border)"></span> <!></a> <h1 class="mt-8 text-4xl font-semibold text-balance md:text-5xl xl:text-6xl xl:leading-[1.125]">Modern Software testing reimagined</h1> <p class="mx-auto mt-8 hidden max-w-2xl text-lg text-wrap sm:block">Tailwindcss highly customizable components for building modern websites and
						applications that look and feel the way you mean it.</p> <p class="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">Highly customizable components for building modern websites and
						applications, with your personal spark.</p> <div class="mt-8"><!></div></div></div> <div class="relative mt-16"><div class="absolute inset-0 z-10 bg-linear-to-b from-transparent from-35% to-background"></div> <div class="relative mx-auto max-w-6xl overflow-hidden px-4"><img class="relative z-2 hidden rounded-2xl border border-border/25 dark:block" src="/music.png" alt="app screen"/> <img class="relative z-2 rounded-2xl border border-border/25 dark:hidden" src="/music-light.png" alt="app screen"/></div></div></div></section> <section class="relative z-10 bg-background pb-16"><div class="m-auto max-w-5xl px-6"><h2 class="text-center text-lg font-medium">Your favorite companies are our partners.</h2> <div class="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 **:fill-foreground sm:gap-x-16 sm:gap-y-12"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div></section></main>`,
	1
);

export default function Hero_eight($$anchor) {
	const // You can store Hero Header Component in seperate file
	// I have used snippet for better readability
	// Hero Header Component
	heroHeader = ($$anchor) => {
		var header = root_1();
		var nav = $.child(header);
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
		$.reset(header);

		$.template_effect(() => {
			$.set_attribute(button, 'aria-label', $.get(menuState) == true ? "Close Menu" : "Open Menu");

			$.set_class(div_3, 1, $.clsx([
				"mb-6  w-full  flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
				$.get(menuState) ? "block lg:flex" : "hidden"
			]));
		});

		$.delegated('click', button, () => $.set(menuState, !$.get(menuState)));
		$.append($$anchor, header);
	};

	let menuItems = [
		{ name: "Features", href: "#a" },
		{ name: "Solution", href: "#a" },
		{ name: "Pricing", href: "#a" },
		{ name: "About", href: "#a" }
	];

	let menuState = $.state(false);
	var fragment = root_3();
	var node_4 = $.first_child(fragment);

	heroHeader(node_4);

	var main = $.sibling(node_4, 2);
	var section = $.child(main);
	var div_6 = $.child(section);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var a_1 = $.child(div_8);
	var node_5 = $.sibling($.child(a_1), 6);

	ArrowRight(node_5, { class: 'size-4' });
	$.reset(a_1);

	var div_9 = $.sibling(a_1, 8);
	var node_6 = $.child(div_9);

	Button(node_6, {
		size: 'lg',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_7 = $.first_child(fragment_1);

			Rocket(node_7, { class: 'relative size-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_7);

	var div_10 = $.sibling(div_7, 2);
	var div_11 = $.sibling($.child(div_10), 2);
	var img = $.child(div_11);

	$.set_attribute(img, 'width', 2796);
	$.set_attribute(img, 'height', 2008);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 2796);
	$.set_attribute(img_1, 'height', 2008);
	$.reset(div_11);
	$.reset(div_10);
	$.reset(div_6);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_12 = $.child(section_1);
	var div_13 = $.sibling($.child(div_12), 2);
	var node_8 = $.child(div_13);

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
	$.reset(div_13);
	$.reset(div_12);
	$.reset(section_1);
	$.reset(main);
	$.append($$anchor, fragment);
}

$.delegate(['click']);