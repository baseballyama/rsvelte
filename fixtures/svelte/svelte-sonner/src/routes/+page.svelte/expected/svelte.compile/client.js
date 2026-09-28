import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster } from '$lib/index.js';
import Expand from '../components/Expand.svelte';
import Footer from '../components/Footer.svelte';
import Hero from '../components/Hero.svelte';
import Installation from '../components/Installation.svelte';
import Other from '../components/Other.svelte';
import Position from '../components/Position.svelte';
import Types from '../components/Types.svelte';
import Usage from '../components/Usage.svelte';
import { richColorsContext } from '$lib/internal/ctx.js';

var root = $.from_html(`<meta content="width=device-width, initial-scale=1" name="viewport"/> <meta name="description" content="An opinionated toast component for Svelte."/> <meta name="keywords" content="svelte, toast, notification, web"/> <meta name="author" content="Robert Soriano"/> <meta name="og:title" content="Svelte Sonner"/> <meta name="og:description" content="An opinionated toast component for Svelte."/> <meta property="og:site_name" content="Svelte Sonner"/> <meta property="og:url" content="https://svelte-sonner.vercel.app"/> <meta property="og:image" content="https://og-image.vercel.app/Svelte%20Sonner"/> <link rel="icon" href="/favicon.png"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@wobsoriano"/> <meta name="twitter:description" content="An opinionated toast component for Svelte."/> <meta name="twitter:title" content="Svelte Sonner"/> <meta name="twitter:image" content="https://og-image.vercel.app/Svelte%20Sonner"/>`, 1);
var root_1 = $.from_html(`<!> <main class="container"><!> <div class="content"><!> <!> <!> <!> <!> <!></div></main> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let expand = $.state(false);
	let position = $.state('bottom-right');
	let richColors = $.state(false);
	let closeButton = $.state(false);

	richColorsContext.set({ setRichColors: (value) => $.set(richColors, value, true) });

	var fragment_1 = root_1();

	$.head('1uha8ag', ($$anchor) => {
		var fragment = root();

		$.next(28);

		$.effect(() => {
			$.document.title = 'Svelte Sonner';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Toaster(node, {
		get expand() {
			return $.get(expand);
		},

		get position() {
			return $.get(position);
		},

		get richColors() {
			return $.get(richColors);
		},

		get closeButton() {
			return $.get(closeButton);
		}
	});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	Hero(node_1, {});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	Installation(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Usage(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Types(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	Position(node_5, {
		get position() {
			return $.get(position);
		},
		setPosition: (pos) => $.set(position, pos, true)
	});

	var node_6 = $.sibling(node_5, 2);

	Expand(node_6, {
		get expand() {
			return $.get(expand);
		},
		setExpand: (exp) => $.set(expand, exp, true)
	});

	var node_7 = $.sibling(node_6, 2);

	Other(node_7, {
		setRichColors: (value) => $.set(richColors, value, true),
		get closeButton() {
			return $.get(closeButton);
		},

		set closeButton($$value) {
			$.set(closeButton, $$value, true);
		}
	});

	$.reset(div);
	$.reset(main);

	var node_8 = $.sibling(main, 2);

	Footer(node_8, {});
	$.append($$anchor, fragment_1);
	$.pop();
}