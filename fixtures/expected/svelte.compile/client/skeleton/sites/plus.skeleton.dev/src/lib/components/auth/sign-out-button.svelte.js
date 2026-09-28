import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { signOut } from '$lib/remote/auth/sign-out.remote';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<form><button><!></button></form>`);

export default function Sign_out_button($$anchor, $$props) {
	const attributes = $.rest_props($$props, rest_excludes);
	var form = root();

	$.attribute_effect(form, () => ({ ...signOut }));

	var button = $.child(form);

	$.attribute_effect(button, () => ({ ...attributes }));

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.reset(form);
	$.append($$anchor, form);
}