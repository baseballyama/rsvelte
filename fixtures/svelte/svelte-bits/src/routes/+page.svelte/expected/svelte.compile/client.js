import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
import Hero from '$lib/components/landing/Hero/Hero.svelte';
import Features from '$lib/components/landing/Features/Features.svelte';
import LiveDemo from '$lib/components/landing/LiveDemo/LiveDemo.svelte';
import QuickStart from '$lib/components/landing/QuickStart/QuickStart.svelte';
import CTA from '$lib/components/landing/CTA/CTA.svelte';
import Footer from '$lib/components/landing/Footer/Footer.svelte';
import LandingLoader from '$lib/components/landing/LandingLoader/LandingLoader.svelte';

var root = $.from_html(`<!> <section><!> <!> <!> <!> <!> <!> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const MIN_LOADER_MS = 800;
	let loaded = $.state(false);
	let hiding = $.state(false);

	function reveal() {
		$.set(hiding, true);

		setTimeout(
			() => {
				$.set(loaded, true);
			},
			600
		);
	}

	$.user_effect(() => {
		if ($.get(loaded)) {
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		} else {
			document.documentElement.style.overflow = 'hidden';
			document.body.style.overflow = 'hidden';
		}
	});

	onMount(() => {
		const start = Date.now();
		const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();

		fontsReady.then(() => {
			const elapsed = Date.now() - start;
			const remaining = Math.max(0, MIN_LOADER_MS - elapsed);

			setTimeout(reveal, remaining);
		});

		return () => {
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		};
	});

	var fragment = root();

	$.head('1uha8ag', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Svelte Bits — Animated UI Components for Svelte';
		});
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			LandingLoader($$anchor, {
				get hiding() {
					return $.get(hiding);
				}
			});
		};

		$.if(node, ($$render) => {
			if (!$.get(loaded)) $$render(consequent);
		});
	}

	var section = $.sibling(node, 2);
	var node_1 = $.child(section);

	Navbar(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Hero(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Features(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	LiveDemo(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	QuickStart(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	CTA(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	Footer(node_7, {});
	$.reset(section);
	$.template_effect(() => $.set_class(section, 1, `landing-wrapper no-side-fades ${$.get(loaded) ? 'ln-loaded' : 'ln-loading'}`));
	$.append($$anchor, fragment);
	$.pop();
}