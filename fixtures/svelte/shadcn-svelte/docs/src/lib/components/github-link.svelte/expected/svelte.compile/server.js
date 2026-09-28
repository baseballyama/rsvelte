import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import Button from "$lib/registry/ui/button/button.svelte";
import { siteConfig } from "$lib/config.js";
import { FALLBACK_STAR_COUNT } from "$lib/constants.js";
import GithubIcon from "./github.svelte";

export default function Github_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		async function getGithubStarCount() {
			try {
				const res = await fetch("https://ungh.cc/repos/huntabyte/shadcn-svelte");
				const data = await res.json();

				return data.repo?.stars ?? FALLBACK_STAR_COUNT;
			} catch(error) {
				console.error(error);

				return FALLBACK_STAR_COUNT;
			}
		}

		let stars = FALLBACK_STAR_COUNT;

		onMount(async () => {
			stars = await getGithubStarCount();
		});

		Button($$renderer, {
			href: siteConfig.links.github,
			target: '_blank',
			rel: 'noreferrer',
			size: 'sm',
			variant: 'ghost',
			class: 'h-8 shadow-none',
			children: ($$renderer) => {
				GithubIcon($$renderer, {});

				$$renderer.push(`<!----> <span class="w-8 text-xs text-muted-foreground tabular-nums">${$.escape(stars >= 1000
					? `${(stars / 1000).toFixed(1)}k`
					: stars.toLocaleString())}</span>`);
			},
			$$slots: { default: true }
		});
	});
}