import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<li><a class="block text-muted-foreground duration-150 hover:text-accent-foreground"><span> </span></a></li>`);
var root_1 = $.from_html(`<header><nav class="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"><div class="m-auto max-w-5xl px-6"><div class="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4"><div class="flex w-full justify-between lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <button class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"><!> <!></button></div> <div><div class="lg:pr-4"><ul class="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm"></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6"><!> <!></div></div></div></div></nav></header>`);

export default function Hero_header_eight($$anchor) {
	let menuItems = [
		{ name: "Features", href: "#a" },
		{ name: "Solution", href: "#a" },
		{ name: "Pricing", href: "#a" },
		{ name: "About", href: "#a" }
	];

	let menuState = $.state(false);
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
}

$.delegate(['click']);