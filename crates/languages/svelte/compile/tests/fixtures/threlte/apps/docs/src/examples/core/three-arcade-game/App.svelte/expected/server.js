import * as $ from 'svelte/internal/server';
import { Canvas, extend } from '@threlte/core';
import { useProgress } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { CustomGridHelper } from './game/objects/CustomGridHelper';
import { game } from './game/Game.svelte';
import Scene from './Scene.svelte';
import { WebGLRenderer } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { progress, finishedOnce } = useProgress();

		extend({ CustomGridHelper });

		$$renderer.push(`<div class="absolute h-full w-full overflow-hidden"><div${$.attr_class('absolute h-full w-full transition-all delay-500 duration-1000', void 0, {
			'opacity-0': !$.store_get($$store_subs ??= {}, '$finishedOnce', finishedOnce)
		})}>`);

		Canvas($$renderer, {
			createRenderer: (canvas) => {
				return new WebGLRenderer({
					canvas,
					powerPreference: 'high-performance',
					antialias: false,
					stencil: false,
					depth: false
				});
			},

			children: ($$renderer) => {
				World($$renderer, {
					gravity: [0, 0, 0],
					children: ($$renderer) => {
						Scene($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (!$.store_get($$store_subs ??= {}, '$finishedOnce', finishedOnce)) {
			$$renderer.push(`<!--[0--><div class="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center p-12 text-2xl text-white">${$.escape(($.store_get($$store_subs ??= {}, '$progress', progress) * 100).toFixed())} %</div>`);
		} else if (game.state === 'off') {
			$$renderer.push(`<!--[1--><div class="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center p-12"><button class="pointer-events-auto rounded-full bg-white px-8 py-4 text-2xl text-black">Insert Coin</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="absolute top-6 right-6"><button class="rounded-full bg-white p-2 *:h-7 *:w-7">`);

		if (game.muted) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path><line x1="240" y1="104" x2="192" y2="152" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="240" y1="152" x2="192" y2="104" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path><line x1="192" y1="104" x2="192" y2="152" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="224" y1="88" x2="224" y2="168" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>`);
		}

		$$renderer.push(`<!--]--></button></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}