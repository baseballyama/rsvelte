import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";

export default function _page($$renderer) {
	let sponsors = [
		{
			name: "Yashash Pugalia",
			avatar: "https://avatars.githubusercontent.com/u/89068816?v=4",
			href: "https://github.com/yashash-pugalia"
		}
	];

	$.head('eulf21', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Sponsors | Shadcn Marketing Blocks</title>`);
		});

		$$renderer.push(`<meta name="description" content="Welcome to Shadcn Marketing Blocks! This is a collection of marketing components built with Svelte 5, Tailwind CSS v4 and Shadcn Svelte."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo"/>`);
	});

	$$renderer.push(`<main class="space-y-6 xl:mb-24"><div class="space-y-3"><h1 class="text-3xl font-bold -tracking-wide text-primary">Sponsors</h1> <div class="grid grid-cols-2 gap-4 border-t py-4 md:grid-cols-6"><!--[-->`);

	const each_array = $.ensure_array_like(sponsors);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let member = each_array[index];

		$$renderer.push(`<a${$.attr('href', member.href)} target="_blank" class="flex flex-col items-center justify-center space-y-1 rounded-xl"><div class="size-20 rounded-full border bg-secondary p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover"${$.attr('src', member.avatar)}${$.attr('alt', member.name)} loading="lazy"/></div> <span class="mt-2 block text-center text-sm">${$.escape(member.name)}</span></a>`);
	}

	$$renderer.push(`<!--]--></div></div> <div class="space-y-4"><div class="space-y-3.5"><a href="#sponsor" id="sponsor" class="text-xl font-medium -tracking-wide text-primary">Become a Sponsor | Share it on Social Media 😊</a> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-muted-foreground">Your support helps us to continue improving and maintaining the project.</p> <div class="space-x-2">`);

	Button($$renderer, {
		href: 'https://github.com/sponsors/SikandarJODD',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Donate on Github`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		target: '_blank',
		href: 'https://twitter.com/intent/tweet?text=I%E2%80%99m%20loving%20these%20free%20Svelte%20marketing%20components%21%0A%0ACheck%20them%20out%20https%3A%2F%2Fsv-blocks.vercel.app%0A%0AThanks%20%40Sikandar_Bhide',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Share on Twitter`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></main>`);
}