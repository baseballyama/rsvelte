import * as $ from 'svelte/internal/server';

export default function _8_$props_id_ts_input($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<form><label${$.attr('for', `${uid}-firstname`)}>First Name:</label> <input${$.attr('id', `${uid}-firstname`)} type="text"/> <label${$.attr('for', `${uid}-lastname`)}>Last Name:</label> <input${$.attr('id', `${uid}-lastname`)} type="text"/></form>`);
}