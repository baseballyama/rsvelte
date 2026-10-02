import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { signIn } from '$lib/remote/auth/sign-in.remote';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'providerId']);
var root = $.from_html(`<form><input/> <button><!></button></form>`);

export default function Sign_in_button($$anchor, $$props) {
	$.push($$props, true);

	const attributes = $.rest_props($$props, rest_excludes);
	var form = root();

	$.attribute_effect(form, ($0) => ({ ...$0 }), [() => signIn.for($$props.providerId)]);

	var input = $.child(form);

	$.attribute_effect(
		input,
		($0) => ({ ...$0 }),
		[
			() => signIn.fields.providerId.as('hidden', $$props.providerId)
		],
		void 0,
		void 0,
		void 0,
		true
	);

	var button = $.sibling(input, 2);

	$.attribute_effect(button, () => ({ ...attributes }));

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}