import * as $ from 'svelte/internal/server';
import { AnimationFrames } from "runed";
import { DemoContainer, Slider, Button } from "@svecodocs/kit";
import Pause from "phosphor-svelte/lib/Pause";
import Play from "phosphor-svelte/lib/Play";
import DemoNote from "../demo-note.svelte";

export default function Animation_frames($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let frames = 0;
		let fpsLimit = 10;
		let delta = 0;

		const animation = new AnimationFrames(
			(args) => {
				frames++;
				delta = args.delta;
			},
			{ fpsLimit: () => fpsLimit }
		);

		const sprites = 10;
		const sheetCols = 3;
		const sheetRows = Math.ceil(sprites / sheetCols);
		const currentSprite = $.derived(() => sprites - 1 - frames % sprites);
		const currentCol = $.derived(() => currentSprite() % sheetCols);
		const currentRow = $.derived(() => Math.floor(currentSprite() / sheetCols));
		const spriteSize = 64;
		const stats = $.derived(() => `Frames: ${frames}\nFPS: ${animation.fps.toFixed(0)}\nDelta: ${delta.toFixed(0)}ms`);

		DemoContainer($$renderer, {
			class: 'relative flex flex-col items-center gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<pre class="text-mono absolute left-2 top-2 m-0 p-2 text-xs">${$.escape(stats())}</pre> <div${$.attr_style(` width: 64px; height: 64px; background: url('/mouse_sprite.png'); background-size: 192px 256px; background-position-x: ${$.stringify(-currentCol() * 64)}px; background-position-y: ${$.stringify(-currentRow() * 64)}px; `)} aria-label="spinning ghost mouse"></div> `);

				Button($$renderer, {
					variant: 'brand',
					class: 'gap-2',
					onclick: animation.toggle,
					children: ($$renderer) => {
						if (animation.running) {
							$$renderer.push('<!--[0-->');
							Pause($$renderer, { size: 16, weight: 'fill' });
						} else {
							$$renderer.push('<!--[-1-->');
							Play($$renderer, { size: 16, weight: 'fill' });
						}

						$$renderer.push(`<!--]--> ${$.escape(animation.running ? "Stop" : "Start")}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p class="m-0 text-center text-sm">FPS limit: <b>${$.escape(fpsLimit)}</b><i>${$.escape(fpsLimit === 0 ? " (not limited)" : "")}</i></p> `);

				Slider($$renderer, {
					class: 'w-[300px]',
					value: [fpsLimit],
					onValueChange: (value) => fpsLimit = value[0] ?? 0,
					min: 0,
					max: 144
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DemoNote($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>Mouse sprite extracted from <a class="hover:text-foreground" target="_blank" href="https://www.animalwell.net/">Animal Well</a></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}