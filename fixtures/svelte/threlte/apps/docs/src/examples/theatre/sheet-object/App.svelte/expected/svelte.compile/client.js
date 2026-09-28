import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Sequence, Theatre } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

var root = $.from_html(`<div class="svelte-1mwxa0b"><!></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ state }));

				Theatre($$anchor, {
					get config() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						Sequence($$anchor, {
							autoplay: true,
							iterationCount: Infinity,
							children: ($$anchor, $$slotProps) => {
								Scene($$anchor, {});
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

	$.reset(div);
	$.append($$anchor, div);
}