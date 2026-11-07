import * as $ from 'svelte/internal/server';
import { longLongName2 } from './imported';

export default function Workspace_symbols($$renderer) {
	function longLongName() {}

	Component($$renderer, {});
	$$renderer.push(`<!----> <!--[-->`);

	const each_array = $.ensure_array_like(['']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let longLongName4 = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(longLongName4)}`);
	}

	$$renderer.push(`<!--]-->}`);
}