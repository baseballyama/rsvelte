import * as $ from 'svelte/internal/server';
import { longpress } from './longpress.js';

export default function Adding_parameters_to_actions_input($$renderer) {
	let pressed = false;
	let duration = 2000;

	$$renderer.push(`<label><input type="range"${$.attr('value', duration)}${$.attr('max', 2000)}${$.attr('step', 100)}/> ${$.escape(duration)}ms</label> <button>press and hold</button> `);

	if (pressed) {
		$$renderer.push(`<!--[0--><p>congratulations, you pressed and held for ${$.escape(duration)}ms</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}