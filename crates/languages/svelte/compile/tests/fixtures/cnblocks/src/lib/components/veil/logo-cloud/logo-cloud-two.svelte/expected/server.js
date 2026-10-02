import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from "svelte";
import { Beacon, Bolt, Cisco, Hulu, Spotify, SupabaseFull, VercelFull } from "$lib/svgs";

export default function Logo_cloud_two($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const logos = {
			ai: [
				{ key: "bolt", component: Bolt, className: "h-3.5 w-full" },
				{ key: "beacon", component: Beacon, className: "h-3.5 w-full" },
				{ key: "hulu", component: Hulu, className: "h-3.5 w-full" }
			],
			hosting: [
				{
					key: "supabase",
					component: SupabaseFull,
					className: "size-5"
				},
				{ key: "spotify", component: Spotify, className: "h-5 w-full" },
				{
					key: "vercel",
					component: VercelFull,
					className: "h-3.5 w-full",
					props: { variant: "full" }
				}
			],
			payments: [
				{ key: "hulu", component: Hulu, className: "h-3.5 w-full" },
				{
					key: "vercel",
					component: VercelFull,
					className: "h-3.5 w-full",
					props: { variant: "full" }
				},
				{ key: "spotify", component: Spotify, className: "h-5 w-full" }
			],
			streaming: [
				{ key: "cisco", component: Cisco, className: "h-5 w-full" },
				{ key: "hulu", component: Hulu, className: "h-3.5 w-full" },
				{ key: "spotify", component: Spotify, className: "h-5 w-full" }
			]
		};

		const groups = Object.keys(logos);
		let currentIndex = 0;
		let currentGroup = groups[currentIndex];
		let timer;

		onMount(() => {
			timer = setInterval(
				() => {
					currentIndex = (currentIndex + 1) % groups.length;
					currentGroup = groups[currentIndex];
				},
				2500
			);
		});

		onDestroy(() => {
			if (timer) clearInterval(timer);
		});

		$$renderer.push(`<section class="bg-background py-12"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto grid h-8 max-w-2xl grid-cols-3 items-center gap-8"><!--[-->`);

		const each_array = $.ensure_array_like(logos[currentGroup]);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let logo = each_array[i];
			const IconLogo = logo.component;

			$$renderer.push(`<div class="logo-item flex items-center justify-center **:fill-foreground! svelte-14lvirp"${$.attr_style(`animation-delay: ${i * 100}ms`)}>`);

			if (IconLogo) {
				$$renderer.push('<!--[-->');
				IconLogo($$renderer, $.spread_props([{ class: logo.className }, logo.props]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}