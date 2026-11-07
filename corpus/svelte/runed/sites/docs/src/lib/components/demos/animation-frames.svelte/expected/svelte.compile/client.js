import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnimationFrames } from "runed";
import { DemoContainer, Slider, Button } from "@svecodocs/kit";
import Pause from "phosphor-svelte/lib/Pause";
import Play from "phosphor-svelte/lib/Play";
import DemoNote from "../demo-note.svelte";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<pre class="text-mono absolute left-2 top-2 m-0 p-2 text-xs"> </pre> <div aria-label="spinning ghost mouse"></div> <!> <p class="m-0 text-center text-sm">FPS limit: <b> </b><i> </i></p> <!>`, 1);
var root_2 = $.from_html(`<p>Mouse sprite extracted from <a class="hover:text-foreground" target="_blank" href="https://www.animalwell.net/">Animal Well</a></p>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Animation_frames($$anchor, $$props) {
	$.push($$props, true);

	let frames = $.state(0);
	let fpsLimit = $.state(10);
	let delta = $.state(0);

	const animation = new AnimationFrames(
		(args) => {
			$.update(frames);
			$.set(delta, args.delta, true);
		},
		{ fpsLimit: () => $.get(fpsLimit) }
	);

	const sprites = 10;
	const sheetCols = 3;
	const sheetRows = Math.ceil(sprites / sheetCols);
	const currentSprite = $.derived(() => sprites - 1 - $.get(frames) % sprites);
	const currentCol = $.derived(() => $.get(currentSprite) % sheetCols);
	const currentRow = $.derived(() => Math.floor($.get(currentSprite) / sheetCols));
	const spriteSize = 64;
	const stats = $.derived(() => `Frames: ${$.get(frames)}\nFPS: ${animation.fps.toFixed(0)}\nDelta: ${$.get(delta).toFixed(0)}ms`);
	var fragment = root_3();
	var node = $.first_child(fragment);

	DemoContainer(node, {
		class: 'relative flex flex-col items-center gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var pre = $.first_child(fragment_1);
			var text = $.only_child(pre, true);
			var div = $.sibling(pre, 2);
			var node_1 = $.sibling(div, 2);

			Button(node_1, {
				variant: 'brand',
				class: 'gap-2',
				get onclick() {
					return animation.toggle;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							Pause($$anchor, { size: 16, weight: 'fill' });
						};

						var alternate = ($$anchor) => {
							Play($$anchor, { size: 16, weight: 'fill' });
						};

						$.if(node_2, ($$render) => {
							if (animation.running) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var text_1 = $.sibling(node_2);

					$.template_effect(() => $.set_text(text_1, ` ${animation.running ? "Stop" : "Start"}`));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node_1, 2);
			var b = $.sibling($.child(p));
			var text_2 = $.only_child(b, true);
			var i = $.sibling(b);
			var text_3 = $.only_child(i, true);

			$.reset(p);

			var node_3 = $.sibling(p, 2);

			{
				let $0 = $.derived(() => [$.get(fpsLimit)]);

				Slider(node_3, {
					class: 'w-[300px]',
					get value() {
						return $.get($0);
					},
					onValueChange: (value) => $.set(fpsLimit, value[0] ?? 0, true),
					min: 0,
					max: 144
				});
			}

			$.template_effect(() => {
				$.set_text(text, $.get(stats));

				$.set_style(div, `
		width: 64px;
		height: 64px;
		background: url('/mouse_sprite.png');
		background-size: 192px 256px;
		background-position-x: ${-$.get(currentCol) * 64}px;
		background-position-y: ${-$.get(currentRow) * 64}px;
	`);

				$.set_text(text_2, $.get(fpsLimit));
				$.set_text(text_3, $.get(fpsLimit) === 0 ? " (not limited)" : "");
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	DemoNote(node_4, {
		children: ($$anchor, $$slotProps) => {
			var p_1 = root_2();

			$.append($$anchor, p_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}