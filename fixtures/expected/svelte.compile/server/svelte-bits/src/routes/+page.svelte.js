import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
import Hero from '$lib/components/landing/Hero/Hero.svelte';
import Features from '$lib/components/landing/Features/Features.svelte';
import LiveDemo from '$lib/components/landing/LiveDemo/LiveDemo.svelte';
import QuickStart from '$lib/components/landing/QuickStart/QuickStart.svelte';
import CTA from '$lib/components/landing/CTA/CTA.svelte';
import Footer from '$lib/components/landing/Footer/Footer.svelte';
import LandingLoader from '$lib/components/landing/LandingLoader/LandingLoader.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const MIN_LOADER_MS = 800;
		let loaded = false;
		let hiding = false;

		function reveal() {
			hiding = true;

			setTimeout(
				() => {
					loaded = true;
				},
				600
			);
		}

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

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Svelte Bits — Animated UI Components for Svelte</title>`);
			});
		});

		if (!loaded) {
			$$renderer.push('<!--[0-->');
			LandingLoader($$renderer, { hiding });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section${$.attr_class(`landing-wrapper no-side-fades ${loaded ? 'ln-loaded' : 'ln-loading'}`)}>`);
		Navbar($$renderer, {});
		$$renderer.push(`<!----> `);
		Hero($$renderer, {});
		$$renderer.push(`<!----> `);
		Features($$renderer, {});
		$$renderer.push(`<!----> `);
		LiveDemo($$renderer, {});
		$$renderer.push(`<!----> `);
		QuickStart($$renderer, {});
		$$renderer.push(`<!----> `);
		CTA($$renderer, {});
		$$renderer.push(`<!----> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></section>`);
	});
}