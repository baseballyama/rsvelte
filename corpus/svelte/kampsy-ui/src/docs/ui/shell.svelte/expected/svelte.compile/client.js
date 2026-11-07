import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextGradient from "$lib/text/textGradient.svelte";
import Webhook from "$lib/icons/webhook.svelte";
import { ThemeSwitcher } from "$lib/index.js";
import { LogoGithub, MenuAlt } from "$lib/icons/index.js";
import MobileNavmenu from "./mobileNavmenu.svelte";
import { preventScroll } from "$lib/utils/general.js";

var root = $.from_html(`<header class="bg-kui-light-bg dark:bg-kui-dark-bg fixed top-0 z-50 mx-auto h-16 w-full max-w-305 md:sticky"><div class=" bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 flex h-16 w-full border-r border-b"><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 hidden h-full w-full max-w-65 border-r border-l lg:block"><div class="hidden h-full w-full items-center px-6 lg:flex"><a href="/"><div class="flex items-center gap-2"><div class="h-6.75 w-6.75"><!></div> <div><!></div></div></a></div></div> <div class="h-full w-full"><div class="flex h-full w-full items-center justify-between px-6"><div class="flex items-center gap-x-3"><div class="block lg:hidden"><div class="flex h-4 w-4 items-center justify-center"><button class="h-4 w-4 bg-transparent"><!></button></div></div> <a href="/"><div class="flex items-center gap-2 lg:hidden"><div class="h-6.75 w-6.75"><!></div> <div><!></div></div></a></div> <div class="flex items-center justify-center gap-x-3"><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 flex h-8 w-8 items-center justify-center rounded-full border"><div class="h-4 w-4"><a href="https://github.com/kampsy/ui" target="_blank" class="text-kui-light-gray-900 hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:hover:text-kui-dark-gray-1000 h-full w-full transition-colors"><!></a></div></div> <!></div></div></div></div></header> <div class="h-16 md:hidden"></div> <main class="flex max-w-305 flex-col min-[1200px]:mt-0 min-[1200px]:grid min-[1200px]:grid-cols-[260px_1fr] md:mx-auto"><aside class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 sticky top-[64px] bottom-0 order-1 hidden h-[calc(100vh-64px)] w-65 flex-col border-r border-l min-[1200px]:flex"><!></aside> <div class="order-2 grow overflow-x-hidden"><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 relative flex h-full w-full flex-col border-r"><!></div></div></main> <!>`, 1);

export default function Shell($$anchor, $$props) {
	$.push($$props, true);

	// Mobile Navmenu
	let isMobileMenuOpen = $.state(false);

	$.user_effect(() => {
		preventScroll($.get(isMobileMenuOpen));
	});

	var fragment = root();
	var header = $.first_child(fragment);
	var div = $.child(header);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var div_3 = $.child(a);
	var div_4 = $.child(div_3);
	var node = $.child(div_4);

	Webhook(node, {});
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_1 = $.child(div_5);

	TextGradient(node_1, {
		text: 'kampsy-ui',
		variant: 'vision',
		class: 'text-base leading-6 font-semibold'
	});

	$.reset(div_5);
	$.reset(div_3);
	$.reset(a);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var div_9 = $.child(div_8);
	var div_10 = $.child(div_9);
	var button = $.child(div_10);
	var node_2 = $.child(button);

	MenuAlt(node_2, {});
	$.reset(button);
	$.reset(div_10);
	$.reset(div_9);

	var a_1 = $.sibling(div_9, 2);
	var div_11 = $.child(a_1);
	var div_12 = $.child(div_11);
	var node_3 = $.child(div_12);

	Webhook(node_3, {});
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_4 = $.child(div_13);

	TextGradient(node_4, {
		text: 'kampsy-ui',
		variant: 'vision',
		class: 'text-base leading-6 font-semibold'
	});

	$.reset(div_13);
	$.reset(div_11);
	$.reset(a_1);
	$.reset(div_8);

	var div_14 = $.sibling(div_8, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.child(div_15);
	var a_2 = $.child(div_16);
	var node_5 = $.child(a_2);

	LogoGithub(node_5, {});
	$.reset(a_2);
	$.reset(div_16);
	$.reset(div_15);

	var node_6 = $.sibling(div_15, 2);

	ThemeSwitcher(node_6, {});
	$.reset(div_14);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);
	$.reset(header);

	var main = $.sibling(header, 4);
	var aside = $.child(main);
	var node_7 = $.child(aside);

	$.snippet(node_7, () => $$props.asideSlot);
	$.reset(aside);

	var div_17 = $.sibling(aside, 2);
	var div_18 = $.child(div_17);
	var node_8 = $.child(div_18);

	$.snippet(node_8, () => $$props.contSlot);
	$.reset(div_18);
	$.reset(div_17);
	$.reset(main);

	var node_9 = $.sibling(main, 2);

	MobileNavmenu(node_9, {
		get asideSlot() {
			return $$props.asideSlot;
		},

		get isOpen() {
			return $.get(isMobileMenuOpen);
		},

		set isOpen($$value) {
			$.set(isMobileMenuOpen, $$value, true);
		}
	});

	$.delegated('click', button, () => $.set(isMobileMenuOpen, !$.get(isMobileMenuOpen)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);