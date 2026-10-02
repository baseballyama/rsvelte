import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from "svelte/transition";
import Button from "$lib/components/ui/button/button.svelte";
import { toggleMode, mode } from "mode-watcher";
import CaretDown from "@lucide/svelte/icons/chevron-down";
import { NavigationMenu } from "bits-ui";
import cn from "clsx";
import Badge from "$lib/components/ui/badge/badge.svelte";
import McpDialog from "./MCPDialog.svelte";
import { page } from "$app/state";

const ThemeToggle = ($$anchor) => {
	Button($$anchor, {
		get onclick() {
			return toggleMode;
		},
		variant: 'ghost',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root_1();

					$.append($$anchor, svg_1);
				};

				$.if(node, ($$render) => {
					if (mode.current === "light") $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const socials = ($$anchor) => {
	var div = root_5();
	var node_1 = $.child(div);

	Button(node_1, {
		target: '_blank',
		href: 'https://github.com/SikandarJODD/cnblocks',
		size: 'icon',
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			var svg_2 = root_3();

			$.append($$anchor, svg_2);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		size: 'icon',
		target: '_blank',
		href: 'https://x.com/Sikandar_Bhide',
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			var svg_3 = root_4();

			$.append($$anchor, svg_3);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	ThemeToggle(node_3);
	$.reset(div);
	$.append($$anchor, div);
};

const ListItem = ($$anchor, $$arg0) => {
	let className = () => ($$arg0?.()).className;
	let title = () => ($$arg0?.()).title;
	let content = () => ($$arg0?.()).content;
	let href = () => ($$arg0?.()).href;
	let soon = $.derived_safe_equal(() => $.fallback(($$arg0?.()).soon, false));
	var li = root_8();
	var node_4 = $.child(li);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_6();
			var node_5 = $.child(div_1);

			Badge(node_5, {
				variant: 'secondary',
				class: 'gap-1.5 rounded-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Soon');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_4, ($$render) => {
			if ($.get(soon)) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => cn("block space-y-1 rounded-md p-2.5 leading-none no-underline outline-hidden transition-colors select-none hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground", className(), $.get(soon) && "opacity-50"));

		$.component(node_6, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
			NavigationMenu_Link($$anchor, {
				get class() {
					return $.get($0);
				},

				get href() {
					return href();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_7();
					var div_2 = $.first_child(fragment_2);
					var text_1 = $.only_child(div_2, true);
					var p = $.sibling(div_2, 2);

					$.html(p, content, true);
					$.reset(p);
					$.template_effect(() => $.set_text(text_1, title()));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(li);
	$.append($$anchor, li);
};

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`);
var root_2 = $.from_html(`<!> <span class="sr-only">Toggle theme</span>`, 1);
var root_3 = $.from_svg(`<svg viewBox="0 0 256 250" width="256" height="250" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"></path></svg>`);
var root_4 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1227" fill="currentColor" viewBox="0 0 1200 1227"><path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"></path></svg>`);
var root_5 = $.from_html(`<div class="flex items-center space-x-0.5"><!> <!> <!></div>`);
var root_6 = $.from_html(`<div class="absolute top-2 right-2 z-50"><!></div>`);
var root_7 = $.from_html(`<div class="text-sm leading-none font-medium"> </div> <p class="line-clamp-2 text-sm leading-snug text-muted-foreground"></p>`, 1);
var root_8 = $.from_html(`<li class="relative"><!> <!></li>`);
var root_9 = $.from_html(`<span class="hidden sm:inline">Home</span>`);
var root_10 = $.from_html(`<span class="hidden sm:inline">Docs</span>`);
var root_11 = $.from_html(`<span class="hidden sm:inline">Veil</span>`);
var root_12 = $.from_html(`Blocks <!>`, 1);
var root_13 = $.from_html(`<div><ul class="grid gap-2 p-2 md:grid-cols-2 lg:w-145"></ul></div>`);
var root_14 = $.from_html(`<!> <!>`, 1);
var root_15 = $.from_html(`Mist <!>`, 1);
var root_16 = $.from_html(`Templates <!>`, 1);
var root_17 = $.from_html(`<div class="mt-4 mb-2 text-lg font-medium">Svelte Shadcn Blocks</div> <p class="text-sm leading-tight text-muted-foreground">50+ UI & Marketing Blocks</p>`, 1);
var root_18 = $.from_html(`<ul class="m-0 grid list-none gap-x-2.5 p-3 sm:w-150 sm:grid-flow-col sm:grid-rows-3"><li class="row-span-3 mb-2 sm:mb-0"><!></li> <!> <!> <!></ul>`);
var root_19 = $.from_html(`<div class="relative top-[70%] size-2.5 rotate-45 rounded-tl-[2px] bg-border"></div>`);
var root_20 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_21 = $.from_html(`<!> <div class="absolute top-full left-0 flex w-full justify-center perspective-[2000px]"><!></div>`, 1);
var root_22 = $.from_html(`<span class="sr-only">Open main menu</span> <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg> <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg>`, 1);
var root_23 = $.from_html(`<a class="block rounded-md px-3 py-2 text-base font-medium text-primary"> </a>`);
var root_24 = $.from_html(`<div class="sm:hidden" id="mobile-menu"><div class="space-y-1 px-2"></div> <div class="flex justify-end pb-2"><!></div></div>`);
var root_25 = $.from_html(`<nav><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex h-16 items-center justify-between"><div class="flex w-full items-center"><a href="/" aria-label="home" class="shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></a> <div class="hidden w-full sm:ml-6 sm:block"><!></div></div> <div class="hidden gap-2 sm:ml-6 sm:flex sm:items-center"><div class="hidden md:block"></div> <!></div> <div class="-mr-2 flex sm:hidden"><!></div></div></div> <!></nav>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	let navs = [
		{ name: "Home", url: "/" },
		{ name: "Docs", url: "/docs/installation" },
		{ name: "Blocks", url: "/hero" },
		{ name: "Veil", url: "/veil", isNew: true },
		{ name: "Mists", url: "/mist/hero", isNew: true },
		{ name: "Templates", url: "/templates" }

		// { name: "Changelog", url: "/changelog" },
	];

	// Mobile and user profile state
	let isMobileMenu = $.state(false);

	// Dark & Light Mode
	let listItems = [
		{
			title: "Hero",
			href: "/hero",
			content: "9 blocks - bold and striking visuals."
		},

		{
			title: "Contact Us",
			href: "/contact",
			content: "2 blocks - clean and simple layouts."
		},

		{
			title: "Features",
			href: "/feature",
			content: "14 blocks - highlight key benefits."
		},

		{
			title: "Sign Up",
			href: "/signup",
			content: "3 blocks - fast and easy signup."
		},

		{
			title: "Integrations",
			href: "/integration",
			content: "8 blocks - connect with top tools."
		},

		{
			title: "Login",
			href: "/login",
			content: "3 blocks - modern, secure designs."
		},

		{
			title: "Testimonials",
			href: "/testimonial",
			content: "6 blocks - trusted user feedback."
		},

		{
			title: "Forgot Password",
			href: "/forgot-password",
			content: "2 blocks - quick reset options."
		},

		{
			title: "Content",
			href: "/content",
			content: "7 blocks - engaging and informative."
		},

		{
			title: "FAQ",
			href: "/faq",
			content: "4 blocks - clear and concise answers."
		}
	];

	let mist_navs = [
		{
			title: "Hero",
			href: "/mist/hero",
			content: "9 blocks - bold and striking visuals."
		},

		{
			title: "Features",
			href: "/mist/feature",
			content: "11 blocks - highlight key benefits."
		},

		{
			title: "Content",
			href: "/mist/content",
			content: "5 blocks - engaging and informative."
		},

		{
			title: "Testimonials",
			href: "/mist/testimonials",
			content: "4 blocks - trusted user feedback."
		},

		{
			title: "Pricing",
			href: "/mist/pricing",
			content: "3 blocks - competitive pricing."
		},

		{
			title: "Team",
			href: "/mist/team",
			content: "3 blocks - team members."
		}
	];

	let isDocs = $.derived(() => {
		let path = page.url.pathname;

		return path.includes("v2-docs");
	});

	var nav_1 = root_25();
	var div_3 = $.child(nav_1);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.sibling($.child(div_5), 2);
	var node_7 = $.child(div_6);

	$.component(node_7, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, {
			class: 'relative z-10 flex w-full justify-center',
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_21();
				var node_8 = $.first_child(fragment_3);

				$.component(node_8, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						class: 'group flex list-none items-center justify-center p-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_20();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
								NavigationMenu_Item($$anchor, {
									id: 'home',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_10 = $.first_child(fragment_5);

										$.component(node_10, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
											NavigationMenu_Link_1($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												href: '/',
												children: ($$anchor, $$slotProps) => {
													var span = root_9();

													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_9, 2);

							$.component(node_11, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
								NavigationMenu_Item_1($$anchor, {
									id: 'docs',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_12 = $.first_child(fragment_6);

										$.component(node_12, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_2) => {
											NavigationMenu_Link_2($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												href: '/v2-docs',
												children: ($$anchor, $$slotProps) => {
													var span_1 = root_10();

													$.append($$anchor, span_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_11, 2);

							$.component(node_13, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
								NavigationMenu_Item_2($$anchor, {
									id: 'veil',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_14 = $.first_child(fragment_7);

										$.component(node_14, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_3) => {
											NavigationMenu_Link_3($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												href: '/veil/features',
												children: ($$anchor, $$slotProps) => {
													var span_2 = root_11();

													$.append($$anchor, span_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_13, 2);

							$.component(node_15, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_3) => {
								NavigationMenu_Item_3($$anchor, {
									id: 'blocks',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_14();
										var node_16 = $.first_child(fragment_8);

										$.component(node_16, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
											NavigationMenu_Trigger($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_9 = root_12();
													var node_17 = $.sibling($.first_child(fragment_9));

													CaretDown(node_17, {
														class: 'relative top-px ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_16, 2);

										$.component(node_18, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
											NavigationMenu_Content($$anchor, {
												class: 'absolute top-0 left-0 w-full data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var div_7 = root_13();
													var ul = $.child(div_7);

													$.each(ul, 21, () => listItems, (component) => component.title, ($$anchor, component) => {
														ListItem($$anchor, () => ({
															href: $.get(component).href,
															title: $.get(component).title,
															content: $.get(component).content
														}));
													});

													$.reset(ul);
													$.reset(div_7);
													$.append($$anchor, div_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_15, 2);

							$.component(node_19, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_4) => {
								NavigationMenu_Item_4($$anchor, {
									id: 'mist',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_14();
										var node_20 = $.first_child(fragment_11);

										$.component(node_20, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
											NavigationMenu_Trigger_1($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_12 = root_15();
													var node_21 = $.sibling($.first_child(fragment_12));

													CaretDown(node_21, {
														class: 'relative top-px ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_20, 2);

										$.component(node_22, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
											NavigationMenu_Content_1($$anchor, {
												class: 'absolute top-0 left-0 w-full data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var div_8 = root_13();
													var ul_1 = $.child(div_8);

													$.each(ul_1, 21, () => mist_navs, (component) => component.title, ($$anchor, component) => {
														ListItem($$anchor, () => ({
															href: $.get(component).href,
															title: $.get(component).title,
															content: $.get(component).content
														}));
													});

													$.reset(ul_1);
													$.reset(div_8);
													$.append($$anchor, div_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_23 = $.sibling(node_19, 2);

							$.component(node_23, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_5) => {
								NavigationMenu_Item_5($$anchor, {
									value: 'templates',
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_14();
										var node_24 = $.first_child(fragment_14);

										$.component(node_24, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_2) => {
											NavigationMenu_Trigger_2($$anchor, {
												class: 'data-[state=open]:shadow-mini group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted dark:hover:bg-muted dark:data-[state=open]:bg-muted',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_15 = root_16();
													var node_25 = $.sibling($.first_child(fragment_15));

													CaretDown(node_25, {
														class: 'relative top-px ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_24, 2);

										$.component(node_26, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_2) => {
											NavigationMenu_Content_2($$anchor, {
												class: 'absolute top-0 left-0 w-full data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var ul_2 = root_18();
													var li_1 = $.child(ul_2);
													var node_27 = $.child(li_1);

													$.component(node_27, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_4) => {
														NavigationMenu_Link_4($$anchor, {
															href: '/',
															class: 'flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-4 no-underline outline-hidden select-none focus:shadow-md',
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = root_17();

																$.next(2);
																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li_1);

													var node_28 = $.sibling(li_1, 2);

													ListItem(node_28, () => ({
														href: "/templates",
														title: "Startup Template",
														content: `Get 30% Off! Use code <span class='text-primary'>ILoveSvelte</span>`
													}));

													var node_29 = $.sibling(node_28, 2);

													ListItem(node_29, () => ({
														title: "Landing Page",
														content: `Stunning Landing Page`,
														soon: true
													}));

													var node_30 = $.sibling(node_29, 2);

													ListItem(node_30, () => ({
														title: "Marketing Template",
														content: `All-in-one Marketing Template`,
														soon: true
													}));

													$.reset(ul_2);
													$.append($$anchor, ul_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							var node_31 = $.sibling(node_23, 2);

							$.component(node_31, () => NavigationMenu.Indicator, ($$anchor, NavigationMenu_Indicator) => {
								NavigationMenu_Indicator($$anchor, {
									class: 'top-full z-10 flex h-2.5 items-end justify-center overflow-hidden opacity-100 transition-[all,transform_250ms_ease] duration-200 data-[state=hidden]:animate-fade-out data-[state=hidden]:opacity-0 data-[state=visible]:animate-fade-in',
									children: ($$anchor, $$slotProps) => {
										var div_9 = root_19();

										$.append($$anchor, div_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var div_10 = $.sibling(node_8, 2);
				var node_32 = $.child(div_10);

				$.component(node_32, () => NavigationMenu.Viewport, ($$anchor, NavigationMenu_Viewport) => {
					NavigationMenu_Viewport($$anchor, {
						class: 'relative mt-2.5 h-(--bits-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden rounded-lg border bg-background text-popover-foreground shadow-lg transition-[width,height] duration-100 data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in sm:w-(--bits-navigation-menu-viewport-width) '
					});
				});

				$.reset(div_10);
				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_6);
	$.reset(div_5);

	var div_11 = $.sibling(div_5, 2);
	var node_33 = $.sibling($.child(div_11), 2);

	socials(node_33);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_34 = $.child(div_12);

	Button(node_34, {
		onclick: () => $.set(isMobileMenu, !$.get(isMobileMenu)),
		size: 'icon',
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_22();
			var svg_4 = $.sibling($.first_child(fragment_17), 2);
			var svg_5 = $.sibling(svg_4, 2);

			$.template_effect(() => {
				$.set_class(svg_4, 0, `${$.get(isMobileMenu) ? 'hidden' : 'block'} size-6`);
				$.set_class(svg_5, 0, `${$.get(isMobileMenu) ? 'block' : 'hidden'} size-6`);
			});

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	$.reset(div_12);
	$.reset(div_4);
	$.reset(div_3);

	var node_35 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_13 = root_24();
			var div_14 = $.child(div_13);

			$.each(div_14, 21, () => navs, $.index, ($$anchor, nav) => {
				var a = root_23();
				var text_2 = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(nav).url);
					$.set_text(text_2, $.get(nav).name);
				});

				$.append($$anchor, a);
			});

			$.reset(div_14);

			var div_15 = $.sibling(div_14, 2);
			var node_36 = $.child(div_15);

			socials(node_36);
			$.reset(div_15);
			$.reset(div_13);
			$.transition(3, div_13, () => slide);
			$.append($$anchor, div_13);
		};

		$.if(node_35, ($$render) => {
			if ($.get(isMobileMenu)) $$render(consequent_2);
		});
	}

	$.reset(nav_1);

	$.template_effect(($0) => $.set_class(nav_1, 1, $0), [
		() => $.clsx(cn("sticky top-0 z-1000 border-b bg-transparent  backdrop-blur-2xl transition-all duration-200"))
	]);

	$.append($$anchor, nav_1);
	$.pop();
}