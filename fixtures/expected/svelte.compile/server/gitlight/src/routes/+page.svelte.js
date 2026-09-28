import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from 'svelte';
import { browser } from '$app/environment';
import { Button, DownloadButton } from '$lib/components';

import {
	ArrowRightIcon,
	GithubIcon,
	HeartIcon,
	LightningIcon,
	SparklesIcon,
	XIcon
} from '$lib/icons';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function onThemeChange({ matches }) {
			document.documentElement.setAttribute('data-theme', matches ? 'dark' : 'light');
		}

		onMount(() => {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChange);
		});

		onDestroy(() => {
			if (!browser) return;

			window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onThemeChange);
		});

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>GitLight • GitHub and GitLab notifications on your desktop</title>`);
			});

			$$renderer.push(`<meta name="description" content="Better GitHub and GitLab notifications as a free, open-source desktop app."/>`);
		});

		$$renderer.push(`<div class="wrapper svelte-1uha8ag"><header class="header svelte-1uha8ag"><div class="title-container svelte-1uha8ag"><img class="logo svelte-1uha8ag" src="/images/logo.webp" alt="" height="32" width="32"/> <h1 class="title svelte-1uha8ag"><strong>GitLight</strong></h1></div> <div class="links svelte-1uha8ag"><a href="https://x.com/colinlienard" target="_blank" rel="noreferrer" class="icon-link svelte-1uha8ag" aria-label="Colin Lienard X account">`);
		XIcon($$renderer, {});
		$$renderer.push(`<!----></a> <a href="https://github.com/colinlienard/gitlight" target="_blank" rel="noreferrer" class="icon-link svelte-1uha8ag" aria-label="GitLight GitHub repository">`);
		GithubIcon($$renderer, {});
		$$renderer.push(`<!----></a></div></header> <main class="main svelte-1uha8ag"><div class="hero-container svelte-1uha8ag"><h2 class="hero svelte-1uha8ag" data-slide="" style="--stagger: 0"><strong>GitHub and GitLab notifications on your desktop</strong></h2> <h3 class="subhero svelte-1uha8ag" data-slide="" style="--stagger: 1">Never miss a pull request, issue, commit, review...</h3></div> <div class="buttons-container svelte-1uha8ag" data-slide="" style="--stagger: 2">`);

		DownloadButton($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						ArrowRightIcon($$renderer, {});
						$$renderer.push(`<!----> Download the app`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			secondary: true,
			href: '/login',
			children: ($$renderer) => {
				$$renderer.push(`<!---->or use in the browser`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <span class="separator svelte-1uha8ag" data-slide="" style="--stagger: 3"></span> <ul class="features-list svelte-1uha8ag" data-slide="" style="--stagger: 4"><li class="feature svelte-1uha8ag">`);
		SparklesIcon($$renderer, {});
		$$renderer.push(`<!----> <h4 class="title svelte-1uha8ag">Filter and monitor events</h4> <p class="description svelte-1uha8ag"><strong>Kanban</strong> style interface.</p></li> <li class="feature svelte-1uha8ag">`);
		HeartIcon($$renderer, {});
		$$renderer.push(`<!----> <h4 class="title svelte-1uha8ag"><strong>Free</strong> and <strong>open source</strong></h4> <p class="description svelte-1uha8ag">Contribute on GitHub!</p></li> <li class="feature svelte-1uha8ag">`);
		LightningIcon($$renderer, {});
		$$renderer.push(`<!----> <h4 class="title svelte-1uha8ag">Made for performance</h4> <p class="description svelte-1uha8ag">Built with <strong>Tauri</strong> and <strong>SvelteKit</strong>.</p></li></ul> <article class="image-container svelte-1uha8ag"><picture class="svelte-1uha8ag"><source class="image svelte-1uha8ag" srcset="/images/gitlight-dark.webp" media="(prefers-color-scheme: dark)" width="1024" height="640"/> <img class="image svelte-1uha8ag" src="/images/gitlight-light.webp" alt="" width="1024" height="640"/></picture></article></main></div>`);
	});
}