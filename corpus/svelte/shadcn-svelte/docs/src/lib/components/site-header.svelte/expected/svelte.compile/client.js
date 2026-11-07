import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import PlusIcon from "@lucide/svelte/icons/plus";
import SquareTerminal from "@lucide/svelte/icons/square-terminal";
import Separator from "$lib/registry/ui/separator/separator.svelte";
import { getColors } from "$lib/colors.js";
import { mainNavItems } from "$lib/navigation.js";
import { Button } from "$lib/registry/ui/button/index.js";
import CommandMenu from "./command-menu/command-menu.svelte";
import Customizer from "./customizer.svelte";
import GithubLink from "./github-link.svelte";
import LayoutToggle from "./layout-toggle.svelte";
import MainNav from "./main-nav.svelte";
import MobileNav from "./mobile-nav.svelte";
import ModeSwitcher from "./mode-switcher.svelte";
import { InitializeProjectCtx } from "../../routes/(app)/(layout)/(create)/components/initialize-project-context.svelte.js";

var root = $.from_html(`<!> Initialize Project`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> New`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<header class="sticky top-0 z-50 w-full bg-background"><div class="container-wrapper px-6 group-has-data-[slot=designer]/layout:max-w-none 3xl:fixed:px-0"><div class="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container"><!> <!> <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end"><div class="hidden w-full flex-1 md:flex md:w-auto md:flex-none"><!></div> <!> <!> <!> <!> <!> <!></div></div></div></header>`);

export default function Site_header($$anchor, $$props) {
	$.push($$props, true);

	const initializeProjectCtx = InitializeProjectCtx.getOr(null);
	const colors = getColors();
	let mobileNavRef;

	function closeMobileMenu() {
		if (mobileNavRef) {
			mobileNavRef.closeMenu();
		}
	}

	var header = root_4();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.bind_this(MobileNav(node, { class: 'flex lg:hidden' }), ($$value) => mobileNavRef = $$value, () => mobileNavRef);

	var node_1 = $.sibling(node, 2);

	MainNav(node_1, {
		get items() {
			return mainNavItems;
		},
		class: 'hidden lg:flex'
	});

	var div_2 = $.sibling(node_1, 2);
	var div_3 = $.child(div_2);
	var node_2 = $.child(div_3);

	CommandMenu(node_2, {
		get colors() {
			return colors;
		},
		closeMobileMenu
	});

	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	Separator(node_3, { orientation: 'vertical', class: 'ml-2 hidden lg:block' });

	var node_4 = $.sibling(node_3, 2);

	GithubLink(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	Separator(node_5, { orientation: 'vertical', class: 'hidden 3xl:flex' });

	var node_6 = $.sibling(node_5, 2);

	LayoutToggle(node_6, { class: 'hidden 3xl:flex' });

	var node_7 = $.sibling(node_6, 2);

	Separator(node_7, { orientation: 'vertical' });

	var node_8 = $.sibling(node_7, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_1();
			var node_9 = $.first_child(fragment);

			ModeSwitcher(node_9, { class: 'md:hidden' });

			var node_10 = $.sibling(node_9, 2);

			Separator(node_10, { orientation: 'vertical' });

			var node_11 = $.sibling(node_10, 2);

			{
				var consequent = ($$anchor) => {
					Button($$anchor, {
						onclick: () => initializeProjectCtx.open = true,
						variant: 'default',
						size: 'sm',
						class: 'hidden md:flex',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_12 = $.first_child(fragment_2);

							SquareTerminal(node_12, {});
							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_11, ($$render) => {
					if (initializeProjectCtx) $$render(consequent);
				});
			}

			$.append($$anchor, fragment);
		};

		var d = $.derived(() => page.url.pathname.startsWith("/create"));

		var alternate = ($$anchor) => {
			var fragment_3 = root_3();
			var node_13 = $.first_child(fragment_3);

			Customizer(node_13, {});

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				href: '/create',
				variant: 'default',
				size: 'sm',
				class: 'h-[31px] rounded-lg',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_15 = $.first_child(fragment_4);

					PlusIcon(node_15, {});
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_8, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}