import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { move } from '@svelteuidev/composables';

const code = `
<div
	use:move
	on:move:start={handleMoveStart}
	on:move={handleMove}
	on:move:stop={handleMoveStop}
	style="position: relative; width: 90%; height: 200px; background-color: lightgrey; margin: 20px;"
>
	<div
		style="position: absolute; cursor: pointer; background-color: {moving
			? 'green'
			: 'red'}; width: 20px; height: 20px; left: calc({position.x *
			100}% - 10px); top: calc({position.y * 100}% - 10px);"
	/>
</div>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div style="position: relative; width: 90%; height: 200px; background-color: lightgrey; margin: 20px;"><div></div></div> <div style="text-align: center; margin-top: 10px;"> </div>`, 1);

export default function Usage($$anchor) {
	let moving = false;
	let position = { x: 0, y: 0 };

	function handleMoveStart() {
		moving = true;
	}

	function handleMove(event) {
		position = event.detail;
	}

	function handleMoveStop() {
		moving = false;
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.only_child(div);

	$.action(div, ($$node) => move?.($$node));
	$.effect(() => $.event('move:start', div, handleMoveStart));
	$.effect(() => $.event('move', div, handleMove));
	$.effect(() => $.event('move:stop', div, handleMoveStop));

	var div_2 = $.sibling(div, 2);
	var text = $.only_child(div_2);

	$.template_effect(() => {
		$.set_style(div_1, `position: absolute; cursor: pointer; background-color: ${moving ? 'green' : 'red'}; width: 20px; height: 20px; left: calc(${position.x * 100}% - 10px); top: calc(${position.y * 100}% - 10px);`);
		$.set_text(text, `X: ${position.x * 100}% Y: ${position.y * 100}%`);
	});

	$.append($$anchor, fragment);
}