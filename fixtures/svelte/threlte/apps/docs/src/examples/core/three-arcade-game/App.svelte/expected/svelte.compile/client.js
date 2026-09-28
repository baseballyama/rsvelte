import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, extend } from '@threlte/core';
import { useProgress } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { CustomGridHelper } from './game/objects/CustomGridHelper';
import { game } from './game/Game.svelte';
import Scene from './Scene.svelte';
import { WebGLRenderer } from 'three';

var root = $.from_html(`<div class="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center p-12 text-2xl text-white"> </div>`);
var root_1 = $.from_html(`<div class="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center p-12"><button class="pointer-events-auto rounded-full bg-white px-8 py-4 text-2xl text-black">Insert Coin</button></div>`);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path><line x1="240" y1="104" x2="192" y2="152" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="240" y1="152" x2="192" y2="104" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>`);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path><line x1="192" y1="104" x2="192" y2="152" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="224" y1="88" x2="224" y2="168" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>`);
var root_4 = $.from_html(`<div class="absolute h-full w-full overflow-hidden"><div><!></div> <!> <div class="absolute top-6 right-6"><button class="rounded-full bg-white p-2 *:h-7 *:w-7"><!></button></div></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const $finishedOnce = () => $.store_get(finishedOnce, '$finishedOnce', $$stores);
	const $progress = () => $.store_get(progress, '$progress', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { progress, finishedOnce } = useProgress();

	extend({ CustomGridHelper });

	var div = root_4();
	var div_1 = $.child(div);
	let classes;
	var node = $.child(div_1);

	Canvas(node, {
		createRenderer: (canvas) => {
			return new WebGLRenderer({
				canvas,
				powerPreference: 'high-performance',
				antialias: false,
				stencil: false,
				depth: false
			});
		},

		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				gravity: [0, 0, 0],
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var text = $.only_child(div_2);

			$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} %`), [() => ($progress() * 100).toFixed()]);
			$.append($$anchor, div_2);
		};

		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var button = $.only_child(div_3);

			$.delegated('click', button, () => {
				game.state = 'intro';
			});

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (!$finishedOnce()) $$render(consequent); else if (game.state === 'off') $$render(consequent_1, 1);
		});
	}

	var div_4 = $.sibling(node_1, 2);
	var button_1 = $.child(div_4);
	var node_2 = $.child(button_1);

	{
		var consequent_2 = ($$anchor) => {
			var svg = root_2();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_3();

			$.append($$anchor, svg_1);
		};

		$.if(node_2, ($$render) => {
			if (game.muted) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_4);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div_1, 1, 'absolute h-full w-full transition-all delay-500 duration-1000', null, classes, { 'opacity-0': !$finishedOnce() }));
	$.delegated('click', button_1, () => game.muted = !game.muted);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);