import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Project, Sequence, Sheet } from '@threlte/theatre';
import Controller from './Controller.svelte';
import Scene from './Scene.svelte';
import stateJson from './state.json';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-d9qvrb"><!> <!></div>`);

export default function App($$anchor) {
	let sequence = $.state(void 0);
	let position = $.state(0);
	let playing = $.state(false);
	let play = $.state(void 0);
	let pause = $.state(void 0);
	let rate = $.state(1);
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ state: stateJson }));

				Project($$anchor, {
					get config() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						Sheet($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_1 = $.first_child(fragment_2);

								Scene(node_1, {});

								var node_2 = $.sibling(node_1, 2);

								Sequence(node_2, {
									iterationCount: 3,
									direction: 'alternate',
									autoplay: true,
									delay: 1000,
									get rate() {
										return $.get(rate);
									},

									get sequence() {
										return $.get(sequence);
									},

									set sequence($$value) {
										$.set(sequence, $$value, true);
									},

									get playing() {
										return $.get(playing);
									},

									set playing($$value) {
										$.set(playing, $$value, true);
									},

									get position() {
										return $.get(position);
									},

									set position($$value) {
										$.set(position, $$value, true);
									},

									get play() {
										return $.get(play);
									},

									set play($$value) {
										$.set(play, $$value, true);
									},

									get pause() {
										return $.get(pause);
									},

									set pause($$value) {
										$.set(pause, $$value, true);
									}
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Controller(node_3, {
		get playing() {
			return $.get(playing);
		},

		get play() {
			return $.get(play);
		},

		get pause() {
			return $.get(pause);
		},

		get position() {
			return $.get(position);
		},

		set position($$value) {
			$.set(position, $$value, true);
		},

		get rate() {
			return $.get(rate);
		},

		set rate($$value) {
			$.set(rate, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}