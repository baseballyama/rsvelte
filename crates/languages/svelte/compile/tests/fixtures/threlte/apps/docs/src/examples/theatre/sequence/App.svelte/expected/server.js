import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Project, Sequence, Sheet } from '@threlte/theatre';
import Controller from './Controller.svelte';
import Scene from './Scene.svelte';
import stateJson from './state.json';

export default function App($$renderer) {
	let sequence = void 0;
	let position = 0;
	let playing = false;
	let play = void 0;
	let pause = void 0;
	let rate = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-d9qvrb">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Project($$renderer, {
					config: { state: stateJson },
					children: ($$renderer) => {
						Sheet($$renderer, {
							children: ($$renderer) => {
								Scene($$renderer, {});
								$$renderer.push(`<!----> `);

								Sequence($$renderer, {
									iterationCount: 3,
									direction: 'alternate',
									autoplay: true,
									delay: 1000,
									rate,
									get sequence() {
										return sequence;
									},

									set sequence($$value) {
										sequence = $$value;
										$$settled = false;
									},

									get playing() {
										return playing;
									},

									set playing($$value) {
										playing = $$value;
										$$settled = false;
									},

									get position() {
										return position;
									},

									set position($$value) {
										position = $$value;
										$$settled = false;
									},

									get play() {
										return play;
									},

									set play($$value) {
										play = $$value;
										$$settled = false;
									},

									get pause() {
										return pause;
									},

									set pause($$value) {
										pause = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Controller($$renderer, {
			playing,
			play,
			pause,
			get position() {
				return position;
			},

			set position($$value) {
				position = $$value;
				$$settled = false;
			},

			get rate() {
				return rate;
			},

			set rate($$value) {
				rate = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}