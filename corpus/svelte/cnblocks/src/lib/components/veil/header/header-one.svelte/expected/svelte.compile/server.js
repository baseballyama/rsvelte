import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/veil/button";
import Logo from "$lib/components/web/Logo.svelte";
import { cn } from "$lib/utils";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";

export default function Header_one($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const menuItems = [
			{ name: "Features", href: "#link" },
			{ name: "Pricing", href: "#link" },
			{ name: "Company", href: "#link" }
		];

		let menuState = false;
		let isScrolled = false;

		onMount(() => {
			const handleScroll = () => {
				isScrolled = window.scrollY > 50;
			};

			handleScroll();
			window.addEventListener("scroll", handleScroll);

			return () => window.removeEventListener("scroll", handleScroll);
		});

		$$renderer.push(`<header><nav${$.attr('data-state', menuState ? "active" : undefined)}${$.attr_class($.clsx(cn("fixed z-20 w-full transition-all duration-300", isScrolled && "border-b border-black/5 bg-background/75 backdrop-blur-lg")))}><div class="mx-auto max-w-5xl px-6"><div class="relative flex flex-wrap items-center justify-between gap-6 py-6 lg:gap-0"><div class="flex w-full justify-between gap-6 lg:w-auto"><a href="/" aria-label="home" class="flex items-center space-x-2">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----></a> <button${$.attr('aria-label', menuState ? "Close Menu" : "Open Menu")} class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">`);

		Menu($$renderer, {
			class: 'm-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0'
		});

		$$renderer.push(`<!----> `);

		X($$renderer, {
			class: 'absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100'
		});

		$$renderer.push(`<!----></button></div> <div class="absolute inset-0 m-auto hidden size-fit lg:block"><ul class="flex gap-1"><!--[-->`);

		const each_array = $.ensure_array_like(menuItems);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<li>`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				href: item.href,
				class: 'text-base',
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(item.name)}</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent"><div class="lg:hidden"><ul class="space-y-6 text-base"><!--[-->`);

		const each_array_1 = $.ensure_array_like(menuItems);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<li><a${$.attr('href', item.href)} class="block text-muted-foreground duration-150 hover:text-accent-foreground"><span>${$.escape(item.name)}</span></a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'sm',
			class: cn(isScrolled && "lg:hidden"),
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<span>Login</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			size: 'sm',
			class: cn(isScrolled && "lg:hidden"),
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<span>Sign Up</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			size: 'sm',
			class: cn(isScrolled ? "lg:inline-flex" : "hidden"),
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<span>Get Started</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></div></nav></header>`);
	});
}