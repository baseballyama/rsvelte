import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<meta name="description" content="Welcome to Shadcn Marketing Blocks! This is a collection of marketing components built with Svelte 5, Tailwind CSS v4 and Shadcn Svelte."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo"/>`, 1);
var root_1 = $.from_html(`<a target="_blank" class="flex flex-col items-center justify-center space-y-1 rounded-xl"><div class="size-20 rounded-full border bg-secondary p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover" loading="lazy"/></div> <span class="mt-2 block text-center text-sm"> </span></a>`);
var root_2 = $.from_html(`<main class="space-y-6 xl:mb-24"><div class="space-y-3"><h1 class="text-3xl font-bold -tracking-wide text-primary">Sponsors</h1> <div class="grid grid-cols-2 gap-4 border-t py-4 md:grid-cols-6"></div></div> <div class="space-y-4"><div class="space-y-3.5"><a href="#sponsor" id="sponsor" class="text-xl font-medium -tracking-wide text-primary">Become a Sponsor | Share it on Social Media 😊</a> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-muted-foreground">Your support helps us to continue improving and maintaining the project.</p> <div class="space-x-2"><!> <!></div></div></div></main>`);

export default function _page($$anchor) {
	let sponsors = [
		{
			name: "Yashash Pugalia",
			avatar: "https://avatars.githubusercontent.com/u/89068816?v=4",
			href: "https://github.com/yashash-pugalia"
		}
	];

	var main = root_2();

	$.head('eulf21', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'Sponsors | Shadcn Marketing Blocks';
		});

		$.append($$anchor, fragment);
	});

	var div = $.child(main);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => sponsors, $.index, ($$anchor, member) => {
		var a = root_1();
		var div_2 = $.child(a);
		var img = $.only_child(div_2);
		var span = $.sibling(div_2, 2);
		var text = $.only_child(span, true);

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(member).href);
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_attribute(img, 'alt', $.get(member).name);
			$.set_text(text, $.get(member).name);
		});

		$.append($$anchor, a);
	});

	$.reset(div_1);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.sibling($.child(div_4), 4);
	var node = $.child(div_5);

	Button(node, {
		href: 'https://github.com/sponsors/SikandarJODD',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Donate on Github');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		variant: 'outline',
		target: '_blank',
		href: 'https://twitter.com/intent/tweet?text=I%E2%80%99m%20loving%20these%20free%20Svelte%20marketing%20components%21%0A%0ACheck%20them%20out%20https%3A%2F%2Fsv-blocks.vercel.app%0A%0AThanks%20%40Sikandar_Bhide',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Share on Twitter');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(main);
	$.append($$anchor, main);
}