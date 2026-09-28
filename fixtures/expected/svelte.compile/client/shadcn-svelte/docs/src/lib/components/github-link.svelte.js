import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import Button from "$lib/registry/ui/button/button.svelte";
import { siteConfig } from "$lib/config.js";
import { FALLBACK_STAR_COUNT } from "$lib/constants.js";
import GithubIcon from "./github.svelte";

var root = $.from_html(`<!> <span class="w-8 text-xs text-muted-foreground tabular-nums"> </span>`, 1);

export default function Github_link($$anchor, $$props) {
	$.push($$props, true);

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

	let stars = $.state($.proxy(FALLBACK_STAR_COUNT));

	onMount(async () => {
		$.set(stars, await getGithubStarCount(), true);
	});

	Button($$anchor, {
		get href() {
			return siteConfig.links.github;
		},
		target: '_blank',
		rel: 'noreferrer',
		size: 'sm',
		variant: 'ghost',
		class: 'h-8 shadow-none',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			GithubIcon(node, {});

			var span = $.sibling(node, 2);
			var text = $.only_child(span, true);

			$.template_effect(($0) => $.set_text(text, $0), [
				() => $.get(stars) >= 1000
					? `${($.get(stars) / 1000).toFixed(1)}k`
					: $.get(stars).toLocaleString()
			]);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}