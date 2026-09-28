import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/veil/button";
import Logo from "$lib/components/web/Logo.svelte";
import { cn } from "$lib/utils";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";

export default function Header_two($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const menuItems = [
			{ name: "Features", href: "#link" },
			{ name: "Pricing", href: "#link" },
			{ name: "Company", href: "#link" }
		];

		let menuState = false;
		let isScrolled = false;
		let isLarge = false;

		onMount(() => {
			const media = window.matchMedia("(min-width: 64rem)");

			const handleScroll = () => {
				isScrolled = window.scrollY > 75;
			};

			const handleMedia = () => {
				isLarge = media.matches;
			};

			handleScroll();
			handleMedia();
			window.addEventListener("scroll", handleScroll);
			media.addEventListener("change", handleMedia);

			return () => {
				window.removeEventListener("scroll", handleScroll);
				media.removeEventListener("change", handleMedia);
			};
		});

		$$renderer.push(`<header><nav${$.attr('data-state', menuState ? "active" : undefined)} class="fixed z-20 w-full"><div class="mx-auto max-w-7xl px-6"><div class="relative flex flex-wrap items-center justify-between gap-6 py-6 lg:gap-0"><div${$.attr_class($.clsx(cn("flex justify-between gap-6 duration-200 max-lg:w-full", isScrolled && "lg:opacity-0 lg:blur-[4px]")))}><div class="hidden size-fit lg:block"><ul class="flex gap-1 max-lg:flex-col"><!--[-->`);

		const each_array = $.ensure_array_like(menuItems);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<li>`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
				href: item.href,
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(item.name)}</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <a href="/" aria-label="home" class="flex items-center space-x-2 lg:hidden">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----></a> <button${$.attr('aria-label', menuState ? "Close Menu" : "Open Menu")} class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">`);

		Menu($$renderer, {
			class: 'm-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0'
		});

		$$renderer.push(`<!----> `);

		X($$renderer, {
			class: 'absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100'
		});

		$$renderer.push(`<!----></button></div> `);

		if (isLarge) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("absolute inset-0 z-50 m-auto flex size-fit h-11 items-center rounded-lg transition-all duration-500", isScrolled
				? "gap-4 bg-card shadow-lg ring-1 shadow-foreground/6.5 ring-border backdrop-blur"
				: "gap-0 bg-transparent")))}><a href="/" aria-label="home" class="px-3.5">`);

			Logo($$renderer, {});

			$$renderer.push(`<!----></a> <div${$.attr_class($.clsx(cn("flex origin-left items-center overflow-hidden rounded-full transition-all duration-500", isScrolled
				? "blur-0 max-w-[32rem] opacity-100"
				: "max-w-0 -translate-x-8 scale-95 opacity-0 blur-[4px]")))}><ul class="flex gap-1 max-lg:flex-col"><!--[-->`);

			const each_array_1 = $.ensure_array_like(menuItems);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];

				$$renderer.push(`<li>`);

				Button($$renderer, {
					variant: 'ghost',
					size: 'sm',
					class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
					href: item.href,
					children: ($$renderer) => {
						$$renderer.push(`<span>${$.escape(item.name)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li>`);
			}

			$$renderer.push(`<!--]--></ul> `);

			Button($$renderer, {
				size: 'sm',
				class: 'mx-2 gap-1 pr-1',
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<span>Get started</span> `);
					ChevronRight($$renderer, { class: 'opacity-50' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl bg-card p-6 shadow-2xl ring-1 shadow-zinc-300/20 ring-border in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-transparent lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent"><div class="lg:hidden"><ul class="flex gap-1 max-lg:flex-col"><!--[-->`);

		const each_array_2 = $.ensure_array_like(menuItems);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let item = each_array_2[$$index_2];

			$$renderer.push(`<li>`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				class: 'w-full text-base max-lg:h-12 max-lg:justify-start max-lg:text-lg',
				href: item.href,
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(item.name)}</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div${$.attr_class($.clsx(cn("flex w-full flex-col space-y-3 duration-200 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit", isScrolled && "lg:opacity-0 lg:blur-[4px]")))}>`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'sm',
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<span>Login</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			size: 'sm',
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<span>Sign Up</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></div></nav></header>`);
	});
}