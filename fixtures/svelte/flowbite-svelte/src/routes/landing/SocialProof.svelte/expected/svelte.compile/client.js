import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from "$lib/avatar/Avatar.svelte";
import Discord from "../utils/icons/Discord.svelte";
import Figma from "../utils/icons/Figma.svelte";
import GitHub from "../utils/icons/GitHub.svelte";
import Npm from "../utils/icons/Npm.svelte";
import Quote from "../utils/icons/Quote.svelte";
import Section from "./utils/Section.svelte";
import { page } from "$app/state";

var root = $.from_html(`<div class="flex flex-col gap-4 lg:flex-row lg:gap-20"><div class="mb-4 flex w-full flex-col items-start justify-center gap-3 md:gap-5 lg:mb-0"><div class="flex w-full flex-col items-start justify-center gap-6"><div class="flex flex-col items-start py-2"><!></div> <div class="flex max-w-2xl flex-col items-start justify-center gap-5 self-stretch pe-8"><p class="text-lg leading-relaxed font-medium text-gray-900 dark:text-white">Flowbite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app
            screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project.</p> <p class="text-lg leading-relaxed font-medium text-gray-900 dark:text-white">Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!</p></div> <div class="flex flex-row items-center gap-3.5 self-stretch"><!> <div class="flex items-center gap-3"><span class="leading-tight font-semibold text-gray-900 dark:text-white">Eugene Fedorenko</span> <span class="leading-tight font-semibold text-gray-900 dark:text-white">/</span> <span class="text-sm leading-tight font-normal">Lead designer at Wildbit</span></div></div></div></div> <div class="flex w-full flex-col items-start gap-6 md:gap-3"><div class="flex flex-row items-start gap-2 self-stretch md:justify-between md:gap-2 md:pe-16 lg:justify-end lg:gap-2 lg:pe-0"><a href="https://github.com/themesberg/flowbite-svelte" class="flex w-full max-w-[272px] flex-col items-start gap-4 rounded-lg text-gray-400 hover:bg-gray-50 lg:px-8 lg:py-6 dark:hover:bg-gray-800"><!> <div class="flex flex-col items-start gap-2"><p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white"> </p> <p class="text-sm text-gray-500 md:text-base dark:text-gray-400">Stars on Github</p></div></a> <a href="https://npmjs.com/package/flowbite-svelte" class="flex w-full max-w-[272px] flex-col items-start gap-4 rounded-lg text-gray-400 hover:bg-gray-50 lg:px-8 lg:py-6 dark:hover:bg-gray-800"><!> <div class="mt-1 flex flex-col items-start gap-2"><p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white"> </p> <p class="text-sm text-gray-500 md:text-base dark:text-gray-400">Downloads on NPM</p></div></a></div> <div class="flex flex-row items-start gap-2 self-stretch md:justify-between md:gap-12 md:pe-16 lg:justify-end lg:gap-2 lg:pe-0"><a href="https://www.figma.com/community/file/1179442320711977498" class="flex w-full max-w-[272px] flex-col items-start gap-4 rounded-lg text-gray-400 hover:bg-gray-50 lg:px-8 lg:py-6 dark:hover:bg-gray-800"><!> <div class="flex flex-col items-start gap-2"><p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white"> </p> <p class="text-sm text-gray-500 md:text-base dark:text-gray-400">Figma duplicates</p></div></a> <a href="https://discord.gg/4eeurUVvTy" rel="nofollow" class="flex w-full max-w-[272px] flex-col items-start gap-4 rounded-lg text-gray-400 hover:bg-gray-50 lg:px-8 lg:py-6 dark:hover:bg-gray-800"><!> <div class="flex flex-col items-start gap-2"><p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white"> </p> <p class="text-sm text-gray-500 md:text-base dark:text-gray-400">Discord members online</p></div></a></div></div></div>`);

export default function SocialProof($$anchor, $$props) {
	$.push($$props, true);

	let data = page.data;
	let github = data.github?.["stargazers_count"] ?? 0;
	let npm = data.npm?.["downloads"] ?? 0;
	let figma = 5400;
	let discord = data.discord?.["approximate_presence_count"] ?? 0;

	function format(x) {
		return x.toLocaleString("en", { notation: "standard" });
	}

	Section($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node = $.child(div_3);

			Quote(node, {});
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 4);
			var node_1 = $.child(div_4);

			Avatar(node_1, { src: '/images/eugene.jpg', size: 'xs' });
			$.next(2);
			$.reset(div_4);
			$.reset(div_2);
			$.reset(div_1);

			var div_5 = $.sibling(div_1, 2);
			var div_6 = $.child(div_5);
			var a = $.child(div_6);
			var node_2 = $.child(a);

			GitHub(node_2, {});

			var div_7 = $.sibling(node_2, 2);
			var p = $.child(div_7);
			var text = $.only_child(p, true);

			$.next(2);
			$.reset(div_7);
			$.reset(a);

			var a_1 = $.sibling(a, 2);
			var node_3 = $.child(a_1);

			Npm(node_3, {});

			var div_8 = $.sibling(node_3, 2);
			var p_1 = $.child(div_8);
			var text_1 = $.only_child(p_1, true);

			$.next(2);
			$.reset(div_8);
			$.reset(a_1);
			$.reset(div_6);

			var div_9 = $.sibling(div_6, 2);
			var a_2 = $.child(div_9);
			var node_4 = $.child(a_2);

			Figma(node_4, {});

			var div_10 = $.sibling(node_4, 2);
			var p_2 = $.child(div_10);
			var text_2 = $.only_child(p_2, true);

			$.next(2);
			$.reset(div_10);
			$.reset(a_2);

			var a_3 = $.sibling(a_2, 2);
			var node_5 = $.child(a_3);

			Discord(node_5, {});

			var div_11 = $.sibling(node_5, 2);
			var p_3 = $.child(div_11);
			var text_3 = $.only_child(p_3, true);

			$.next(2);
			$.reset(div_11);
			$.reset(a_3);
			$.reset(div_9);
			$.reset(div_5);
			$.reset(div);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text, $0);
					$.set_text(text_1, $1);
					$.set_text(text_2, $2);
					$.set_text(text_3, $3);
				},
				[
					() => format(github),
					() => format(npm),
					() => format(figma),
					() => format(discord)
				]
			);

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}