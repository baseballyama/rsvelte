import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Sheet, Theatre } from '@threlte/theatre';
import { onMount } from 'svelte';
import { NoToneMapping, WebGLRenderer } from 'three';
import App from './App.svelte';
import FadeOut from './FadeOut.svelte';
import Intro from './Intro/Intro.svelte';
import Reveal from './Reveal.svelte';
import TextEffect from './TextEffect.svelte';
import Trigger from './Trigger.svelte';

import {
	_springScrollPos,
	mouseCoords,
	mouseCoordsSpring,
	scrollPos,
	springScrollPos
} from './scrollPos';

import state from './state.json';

export default function HeroWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// import { debug } from './state'
		const onScroll = () => {
			// get normalized scroll position in document. 0 should equal top of page, 1
			// should equal 1 page height from top, 2 should equal 2 page heights from
			// top, etc. This allows easier addition of content to the bottom as opposed
			// to a normalized scroll position where 1 is the bottom of the page.
			const newScrollPos = Math.max(window.scrollY / window.innerHeight, 0);

			scrollPos.set(newScrollPos);
			_springScrollPos.set(newScrollPos);
		};

		onMount(() => {
			const newScrollPos = Math.max(window.scrollY / window.innerHeight, 0);

			scrollPos.set(newScrollPos);
			_springScrollPos.set(newScrollPos, { hard: true });
		});

		const onKeyDown = (_e) => {
			// if (e.key === 'd') debug.set(!debug.current)
		};

		const onMouseMove = (e) => {
			// get normalized mouse coords
			const x = e.clientX / window.innerWidth;

			const y = e.clientY / window.innerHeight;

			mouseCoords.set({ x, y });
			mouseCoordsSpring.set({ x, y });
		};

		$$renderer.push(`<div class="pointer-events-none relative z-20 h-[500vh]">`);

		Theatre($$renderer, {
			config: { state },
			studio: { enabled: false },
			children: ($$renderer) => {
				$$renderer.push(`<div class="fixed top-0 left-0 z-10 h-lvh w-screen">`);

				Canvas($$renderer, {
					toneMapping: NoToneMapping,
					createRenderer: (canvas) => {
						return new WebGLRenderer({
							canvas,
							alpha: true,
							powerPreference: 'high-performance',
							antialias: false,
							stencil: false,
							depth: false,
							premultipliedAlpha: true
						});
					},

					children: ($$renderer) => {
						App($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="pointer-events-auto contents">`);

				Sheet($$renderer, {
					name: 'Intro',
					children: ($$renderer) => {
						Intro($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				{
					function children($$renderer) {
						const start = 0.6;
						const stagger = 0.3;
						const duration = 0.6;
						const outStart = 2.2;
						const outEnd = 2.7;

						$$renderer.push(`<div class="pointer-events-auto fixed bottom-0 left-0 hidden w-screen justify-center p-12 md:flex"><div class="grid max-w-[1200px] grid-cols-3 gap-12"><div class="col-span-1">`);

						Reveal($$renderer, {
							progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
							from: start,
							to: start + duration,
							children: ($$renderer) => {
								FadeOut($$renderer, {
									progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
									from: outStart,
									to: outEnd,
									children: ($$renderer) => {
										$$renderer.push(`<h3 class="mb-2 text-2xl font-bold text-white/90">Learn Threlte</h3> <p class="text-faded text-sm">Threlte puts the simplicity of Svelte 5 and the power of Three.js right at your
                    fingertips. It's designed to be powerful and flexible while still being
                    approachable and easy to use.</p>`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="col-span-1">`);

						Reveal($$renderer, {
							progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
							from: start + stagger,
							to: start + stagger + duration,
							children: ($$renderer) => {
								FadeOut($$renderer, {
									progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
									from: outStart,
									to: outEnd,
									children: ($$renderer) => {
										$$renderer.push(`<h3 class="mb-2 text-2xl font-bold text-white/90">Master Three.js</h3> <p class="text-faded text-sm">The web is becoming more and more 3D. At its core, Threlte provides an
                    extendable declarative API for creating scalable Three.js applications for the
                    web.</p>`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="col-span-1">`);

						Reveal($$renderer, {
							progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
							from: start + stagger * 2,
							to: start + stagger * 2 + duration,
							children: ($$renderer) => {
								FadeOut($$renderer, {
									progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
									from: outStart,
									to: outEnd,
									children: ($$renderer) => {
										$$renderer.push(`<h3 class="mb-2 text-2xl font-bold text-white/90">Integrate Anything</h3> <p class="text-faded text-sm">Threlte comes with solutions for physics, XR, animation, layouting, model
                    loading, and countless helpers to make creating immersive 3D apps for the web a
                    breeze.</p>`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div></div>`);
					}

					Trigger($$renderer, { in: 0.5, out: 2.7, children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				Trigger($$renderer, {
					in: 2.7,
					out: 4,
					children: ($$renderer) => {
						$$renderer.push(`<h2 class="fixed top-[66svh] top-[66vh] left-0 flex w-screen flex-col items-center justify-center">`);

						TextEffect($$renderer, {
							id: 'intro',
							type: 'fade-up',
							progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
							class: 'inline-block text-xl text-white/70 md:text-3xl',
							in: { start: 2.7, end: 3.1 },
							out: { start: 3.6, end: 3.9 },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Introducing`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TextEffect($$renderer, {
							progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
							id: 't6',
							type: 'fade-up-skew-individual',
							class: 'inline-block text-6xl font-bold text-white md:text-7xl',
							in: { start: 2.8, end: 3.5 },
							out: { start: 3.7, end: 4 },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Threlte 8`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></h2>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}