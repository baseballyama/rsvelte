import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/> <input/>`, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	/** some comment */
	/** this should stay a comment */
	// this should also stay a comment
	// this should stay as well
	/*
		* this is a same-line leading multiline comment
		**/
	/*
		* this is a same-line trailing multiline comment
		**/
	let optional = $.prop($$props, 'optional', 3, 'foo'),
		binding = $.prop($$props, 'binding', 15),
		bindingOptional = $.prop($$props, 'bindingOptional', 15, 'bar'),
		no_type_but_comment = $.prop($$props, 'no_type_but_comment', 3, 0),
		no_type_and_inline_comment = $.prop($$props, 'no_type_and_inline_comment', 3, 0),
		inline_multiline_leading_comment = $.prop($$props, 'inline_multiline_leading_comment', 3, 'world'),
		inline_multiline_trailing_comment = $.prop($$props, 'inline_multiline_trailing_comment', 3, 'world');

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