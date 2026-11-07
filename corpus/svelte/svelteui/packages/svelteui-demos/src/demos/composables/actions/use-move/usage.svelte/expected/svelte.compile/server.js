import * as $ from 'svelte/internal/server';
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

export default function Usage($$renderer) {
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

	$$renderer.push(`<div style="position: relative; width: 90%; height: 200px; background-color: lightgrey; margin: 20px;"><div${$.attr_style(`position: absolute; cursor: pointer; background-color: ${moving ? 'green' : 'red'}; width: 20px; height: 20px; left: calc(${$.stringify(position.x * 100)}% - 10px); top: calc(${$.stringify(position.y * 100)}% - 10px);`)}></div></div> <div style="text-align: center; margin-top: 10px;">X: ${$.escape(position.x * 100)}% Y: ${$.escape(position.y * 100)}%</div>`);
}