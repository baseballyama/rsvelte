import 'svelte/internal/disclose-version';
import foo1 from '../../foo';
import * as $ from 'svelte/internal/client';
import foo2 from '../../foo';

import('../../bar');

export { x } from '../../x';

function f(mhm) {}

var root = $.from_html(`<button>click</button>`);

export default function Input($$anchor) {
	import('../../bar');

	/** @type {import('../../mhm').mhm} */
	let mhm = true;

	/** @param {import('../../mhm'.mhm)} mhm */
	function f(mhm) {}

	var button = root();

	$.delegated('click', button, () => {
		import('../../bar');

		/** @type {import('../../mhm').mhm} */
		let mhm = true;

		/** @param {import('../../mhm').mhm} mhm */
		function f(mhm) {}
	});

	$.append($$anchor, button);
}

$.delegate(['click']);