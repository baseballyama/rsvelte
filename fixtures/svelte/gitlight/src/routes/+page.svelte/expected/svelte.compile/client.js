import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<meta name="description" content="Better GitHub and GitLab notifications as a free, open-source desktop app."/>`);
var root_1 = $.from_html(`<!> Download the app`, 1);
var root_2 = $.from_html(`<div class="wrapper svelte-1uha8ag"><header class="header svelte-1uha8ag"><div class="title-container svelte-1uha8ag"><img class="logo svelte-1uha8ag" src="/images/logo.webp" alt="" height="32" width="32"/> <h1 class="title svelte-1uha8ag"><strong>GitLight</strong></h1></div> <div class="links svelte-1uha8ag"><a href="https://x.com/colinlienard" target="_blank" rel="noreferrer" class="icon-link svelte-1uha8ag" aria-label="Colin Lienard X account"><!></a> <a href="https://github.com/colinlienard/gitlight" target="_blank" rel="noreferrer" class="icon-link svelte-1uha8ag" aria-label="GitLight GitHub repository"><!></a></div></header> <main class="main svelte-1uha8ag"><div class="hero-container svelte-1uha8ag"><h2 class="hero svelte-1uha8ag" data-slide="" style="--stagger: 0"><strong>GitHub and GitLab notifications on your desktop</strong></h2> <h3 class="subhero svelte-1uha8ag" data-slide="" style="--stagger: 1">Never miss a pull request, issue, commit, review...</h3></div> <div class="buttons-container svelte-1uha8ag" data-slide="" style="--stagger: 2"><!> <!></div> <span class="separator svelte-1uha8ag" data-slide="" style="--stagger: 3"></span> <ul class="features-list svelte-1uha8ag" data-slide="" style="--stagger: 4"><li class="feature svelte-1uha8ag"><!> <h4 class="title svelte-1uha8ag">Filter and monitor events</h4> <p class="description svelte-1uha8ag"><strong>Kanban</strong> style interface.</p></li> <li class="feature svelte-1uha8ag"><!> <h4 class="title svelte-1uha8ag"><strong>Free</strong> and <strong>open source</strong></h4> <p class="description svelte-1uha8ag">Contribute on GitHub!</p></li> <li class="feature svelte-1uha8ag"><!> <h4 class="title svelte-1uha8ag">Made for performance</h4> <p class="description svelte-1uha8ag">Built with <strong>Tauri</strong> and <strong>SvelteKit</strong>.</p></li></ul> <article class="image-container svelte-1uha8ag"><picture class="svelte-1uha8ag"><source class="image svelte-1uha8ag" srcset="/images/gitlight-dark.webp" media="(prefers-color-scheme: dark)" width="1024" height="640"/> <img class="image svelte-1uha8ag" src="/images/gitlight-light.webp" alt="" width="1024" height="640"/></picture></article></main></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_2();

	$.head('1uha8ag', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'GitLight • GitHub and GitLab notifications on your desktop';
		});

		$.append($$anchor, meta);
	});

	var header = $.child(div);
	var div_1 = $.sibling($.child(header), 2);
	var a = $.child(div_1);
	var node = $.child(a);

	XIcon(node, {});
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_1 = $.child(a_1);

	GithubIcon(node_1, {});
	$.reset(a_1);
	$.reset(div_1);
	$.reset(header);

	var main = $.sibling(header, 2);
	var div_2 = $.sibling($.child(main), 2);
	var node_2 = $.child(div_2);

	DownloadButton(node_2, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_3 = $.first_child(fragment_1);

					ArrowRightIcon(node_3, {});
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		secondary: true,
		href: '/login',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('or use in the browser');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var ul = $.sibling(div_2, 4);
	var li = $.child(ul);
	var node_5 = $.child(li);

	SparklesIcon(node_5, {});
	$.next(4);
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_6 = $.child(li_1);

	HeartIcon(node_6, {});
	$.next(4);
	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var node_7 = $.child(li_2);

	LightningIcon(node_7, {});
	$.next(4);
	$.reset(li_2);
	$.reset(ul);
	$.next(2);
	$.reset(main);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}