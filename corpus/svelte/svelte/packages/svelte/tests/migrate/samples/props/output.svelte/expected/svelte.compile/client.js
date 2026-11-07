import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/> <input/>`, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {Record<string, { href: string; title: string; }[]>} readonly
	 * @property {string} [optional]
	 * @property {any} binding
	 * @property {string} [bindingOptional]
	 */
	/** @type {Props} */
	let optional = $.prop($$props, 'optional', 3, 'foo'),
		binding = $.prop($$props, 'binding', 15),
		bindingOptional = $.prop($$props, 'bindingOptional', 15, 'bar');

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var input = $.sibling(text);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	$.template_effect(() => $.set_text(text, `${$$props.readonly ?? ''}
${optional() ?? ''} `));

	$.bind_value(input, binding);
	$.bind_value(input_1, bindingOptional);
	$.append($$anchor, fragment);
	$.pop();
}