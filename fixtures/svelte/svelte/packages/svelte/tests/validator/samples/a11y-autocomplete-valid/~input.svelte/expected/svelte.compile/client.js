import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <input type="text" autocomplete="name"/> <input type="text" autocomplete="off"/> <input type="text" autocomplete="on"/> <input type="text" autocomplete="billing family-name"/> <input type="hidden" autocomplete="section-blue shipping street-address"/> <input type="text" autocomplete="section-somewhere shipping work email"/> <input type="text" autocomplete="section-somewhere shipping work email webauthn"/> <input type="text" autocomplete="SECTION-SOMEWHERE SHIPPING WORK EMAIL WEBAUTHN"/> <input type="TEXT" autocomplete="ON"/> <input type="email" autocomplete="url"/> <input type="text" autocomplete="section-blue shipping street-address"/> <input type="hidden" autocomplete="off"/> <input type="hidden" autocomplete="on"/> <input type="text" autocomplete=""/> <input autocomplete=""/> <input type="text"/> <input type="text" autocomplete=""/> <input type="text" autocomplete="incorrect"/> <input type="text" autocomplete="webauthn"/>`, 1);

export default function Input($$anchor) {
	let dynamic = '';
	var fragment = root();
	var input = $.sibling($.first_child(fragment), 30);

	$.set_attribute(input, 'type', dynamic);

	var input_1 = $.sibling(input, 2);

	$.set_attribute(input_1, 'autocomplete', dynamic);
	$.next(6);
	$.append($$anchor, fragment);
}