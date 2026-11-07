import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from "svelte";
import { Beacon, Bolt, Cisco, Hulu, Spotify, SupabaseFull, VercelFull } from "$lib/svgs";

var root = $.from_html(`<div class="logo-item flex items-center justify-center **:fill-foreground! svelte-14lvirp"><!></div>`);
var root_1 = $.from_html(`<section class="bg-background py-12"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto grid h-8 max-w-2xl grid-cols-3 items-center gap-8"></div></div></section>`);

export default function Logo_cloud_two($$anchor, $$props) {
	$.push($$props, true);

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

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);

	$.each(div_1, 23, () => logos[currentGroup], (logo, i) => `${currentGroup}-${logo.key}-${i}`, ($$anchor, logo, i) => {
		const IconLogo = $.derived(() => $.get(logo).component);
		var div_2 = root();
		var node = $.child(div_2);

		$.component(node, () => $.get(IconLogo), ($$anchor, IconLogo_1) => {
			IconLogo_1($$anchor, $.spread_props(
				{
					get class() {
						return $.get(logo).className;
					}
				},
				() => $.get(logo).props
			));
		});

		$.reset(div_2);
		$.template_effect(() => $.set_style(div_2, `animation-delay: ${$.get(i) * 100}ms`));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}