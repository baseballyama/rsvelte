import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { linkAccount } from '$lib/remote/auth/link-account.remote';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'providerId',
	'callbackURL'
]);

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<form><input/> <!> <button><!></button></form>`);

export default function Link_account_button($$anchor, $$props) {
	$.push($$props, true);

	const attributes = $.rest_props($$props, rest_excludes);
	var form = root_1();

	$.attribute_effect(form, ($0) => ({ ...$0 }), [() => linkAccount.for($$props.providerId)]);

	var input = $.child(form);

	$.attribute_effect(
		input,
		($0) => ({ ...$0 }),
		[
			() => linkAccount.fields.providerId.as('hidden', $$props.providerId)
		],
		void 0,
		void 0,
		void 0,
		true
	);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var input_1 = root();

			$.attribute_effect(
				input_1,
				($0) => ({ ...$0 }),
				[
					() => linkAccount.fields.callbackURL.as('hidden', $$props.callbackURL)
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.append($$anchor, input_1);
		};

		$.if(node, ($$render) => {
			if ($$props.callbackURL) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.attribute_effect(button, () => ({ ...attributes }));

	var node_1 = $.child(button);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(button);
	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}