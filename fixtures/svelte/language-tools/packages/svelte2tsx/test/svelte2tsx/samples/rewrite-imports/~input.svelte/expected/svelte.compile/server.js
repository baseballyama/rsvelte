import * as $ from 'svelte/internal/server';
import foo2 from '../../foo';
import foo1 from '../../foo';

import('../../bar');

export { x } from '../../x';

function f(mhm) {}

export default function Input($$renderer) {
	import('../../bar');

	/** @type {import('../../mhm').mhm} */
	let mhm = true;

	/** @param {import('../../mhm'.mhm)} mhm */
	function f(mhm) {}

	$$renderer.push(`<button>click</button>`);
}