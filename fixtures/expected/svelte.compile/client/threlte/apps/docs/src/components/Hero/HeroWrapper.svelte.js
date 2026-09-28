import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`<h3 class="mb-2 text-2xl font-bold text-white/90">Learn Threlte</h3> <p class="text-faded text-sm">Threlte puts the simplicity of Svelte 5 and the power of Three.js right at your
                    fingertips. It's designed to be powerful and flexible while still being
                    approachable and easy to use.</p>`,
	1
);

var root_1 = $.from_html(
	`<h3 class="mb-2 text-2xl font-bold text-white/90">Master Three.js</h3> <p class="text-faded text-sm">The web is becoming more and more 3D. At its core, Threlte provides an
                    extendable declarative API for creating scalable Three.js applications for the
                    web.</p>`,
	1
);

var root_2 = $.from_html(
	`<h3 class="mb-2 text-2xl font-bold text-white/90">Integrate Anything</h3> <p class="text-faded text-sm">Threlte comes with solutions for physics, XR, animation, layouting, model
                    loading, and countless helpers to make creating immersive 3D apps for the web a
                    breeze.</p>`,
	1
);

var root_3 = $.from_html(`<div class="pointer-events-auto fixed bottom-0 left-0 hidden w-screen justify-center p-12 md:flex"><div class="grid max-w-[1200px] grid-cols-3 gap-12"><div class="col-span-1"><!></div> <div class="col-span-1"><!></div> <div class="col-span-1"><!></div></div></div>`);
var root_4 = $.from_html(`<h2 class="fixed top-[66svh] top-[66vh] left-0 flex w-screen flex-col items-center justify-center"><!> <!></h2>`);
var root_5 = $.from_html(`<div class="fixed top-0 left-0 z-10 h-lvh w-screen"><!></div> <div class="pointer-events-auto contents"><!></div> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="pointer-events-none relative z-20 h-[500vh]"><!></div>`);

export default function HeroWrapper($$anchor, $$props) {
	$.push($$props, true);

	const $springScrollPos = () => $.store_get(springScrollPos, '$springScrollPos', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var div = root_6();

	$.event('scroll', $.window, onScroll);
	$.event('keydown', $.window, onKeyDown);
	$.event('mousemove', $.window, onMouseMove);

	var node = $.child(div);

	{
		let $0 = $.derived(() => ({ state }));

		Theatre(node, {
			get config() {
				return $.get($0);
			},
			studio: { enabled: false },
			children: ($$anchor, $$slotProps) => {
				var fragment = root_5();
				var div_1 = $.first_child(fragment);
				var node_1 = $.child(div_1);

				Canvas(node_1, {
					get toneMapping() {
						return NoToneMapping;
					},

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

					children: ($$anchor, $$slotProps) => {
						App($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_2 = $.child(div_2);

				Sheet(node_2, {
					name: 'Intro',
					children: ($$anchor, $$slotProps) => {
						Intro($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.reset(div_2);

				var node_3 = $.sibling(div_2, 2);

				{
					const children = ($$anchor) => {
						const start = $.derived(() => 0.6);
						const stagger = $.derived(() => 0.3);
						const duration = $.derived(() => 0.6);
						const outStart = $.derived(() => 2.2);
						const outEnd = $.derived(() => 2.7);
						var div_3 = root_3();
						var div_4 = $.child(div_3);
						var div_5 = $.child(div_4);
						var node_4 = $.child(div_5);

						Reveal(node_4, {
							get progress() {
								return $springScrollPos();
							},
							from: $.get(start),
							to: $.get(start) + $.get(duration),
							children: ($$anchor, $$slotProps) => {
								FadeOut($$anchor, {
									get progress() {
										return $springScrollPos();
									},
									from: $.get(outStart),
									to: $.get(outEnd),
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();

										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.reset(div_5);

						var div_6 = $.sibling(div_5, 2);
						var node_5 = $.child(div_6);

						Reveal(node_5, {
							get progress() {
								return $springScrollPos();
							},
							from: $.get(start) + $.get(stagger),
							to: $.get(start) + $.get(stagger) + $.get(duration),
							children: ($$anchor, $$slotProps) => {
								FadeOut($$anchor, {
									get progress() {
										return $springScrollPos();
									},
									from: $.get(outStart),
									to: $.get(outEnd),
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();

										$.next(2);
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.reset(div_6);

						var div_7 = $.sibling(div_6, 2);
						var node_6 = $.child(div_7);

						Reveal(node_6, {
							get progress() {
								return $springScrollPos();
							},
							from: $.get(start) + $.get(stagger) * 2,
							to: $.get(start) + $.get(stagger) * 2 + $.get(duration),
							children: ($$anchor, $$slotProps) => {
								FadeOut($$anchor, {
									get progress() {
										return $springScrollPos();
									},
									from: $.get(outStart),
									to: $.get(outEnd),
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_2();

										$.next(2);
										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.reset(div_7);
						$.reset(div_4);
						$.reset(div_3);
						$.append($$anchor, div_3);
					};

					Trigger(node_3, { in: 0.5, out: 2.7, children, $$slots: { default: true } });
				}

				var node_7 = $.sibling(node_3, 2);

				Trigger(node_7, {
					in: 2.7,
					out: 4,
					children: ($$anchor, $$slotProps) => {
						var h2 = root_4();
						var node_8 = $.child(h2);

						TextEffect(node_8, {
							id: 'intro',
							type: 'fade-up',
							get progress() {
								return $springScrollPos();
							},
							class: 'inline-block text-xl text-white/70 md:text-3xl',
							in: { start: 2.7, end: 3.1 },
							out: { start: 3.6, end: 3.9 },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Introducing');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						TextEffect(node_9, {
							get progress() {
								return $springScrollPos();
							},
							id: 't6',
							type: 'fade-up-skew-individual',
							class: 'inline-block text-6xl font-bold text-white md:text-7xl',
							in: { start: 2.8, end: 3.5 },
							out: { start: 3.7, end: 4 },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Threlte 8');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(h2);
						$.append($$anchor, h2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}