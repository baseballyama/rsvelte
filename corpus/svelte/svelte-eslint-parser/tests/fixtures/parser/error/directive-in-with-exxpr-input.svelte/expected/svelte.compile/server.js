import * as $ from 'svelte/internal/server';
import { fade, fly } from 'svelte/transition';

export default function Directive_in_with_exxpr_input($$renderer) {
	let visible = true;
	const foo = { fade, fly };

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>Flies in, fades out</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}