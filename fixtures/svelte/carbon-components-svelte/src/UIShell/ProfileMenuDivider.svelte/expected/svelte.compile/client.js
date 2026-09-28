import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr aria-hidden="true"/>`);

export default function ProfileMenuDivider($$anchor) {
	var hr = root();

	$.set_class(hr, 1, '', null, {}, { 'bx--profile-menu__divider': true });
	$.append($$anchor, hr);
}