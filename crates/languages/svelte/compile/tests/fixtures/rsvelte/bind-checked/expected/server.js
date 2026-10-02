import * as $ from 'svelte/internal/server';

export default function Bind_checked($$renderer) {
	let agreed = false;
	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', agreed, true)}/> I agree</label> `);
	if (agreed) {
		$$renderer.push(`<!--[0--><p>Thanks.</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}
	$$renderer.push(`<!--]-->`);
}
