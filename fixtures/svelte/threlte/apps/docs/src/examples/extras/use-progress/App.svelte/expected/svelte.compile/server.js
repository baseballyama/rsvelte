import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { fade } from 'svelte/transition';
import { fromStore } from 'svelte/store';
import { useProgress } from '@threlte/extras';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { progress } = useProgress();
		const p = fromStore(progress);
		const tweenedProgress = Tween.of(() => p.current, { duration: 150 });
		const progressWidth = $.derived(() => 100 * tweenedProgress.current);
		const progressLessThanOne = $.derived(() => tweenedProgress.current < 1);

		$$renderer.push(`<div class="main svelte-pz6rrp">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (progressLessThanOne()) {
			$$renderer.push(`<!--[0--><div class="wrapper svelte-pz6rrp"><p class="loading svelte-pz6rrp">Loading</p> <div class="bar-wrapper svelte-pz6rrp"><div class="bar svelte-pz6rrp"${$.attr_style(`width: ${$.stringify(progressWidth())}%`)}></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}