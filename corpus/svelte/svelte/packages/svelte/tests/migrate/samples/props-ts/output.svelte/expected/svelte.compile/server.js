import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			readonly,
			optional = 'foo',
			binding = void 0,
			bindingOptional = 'bar',
			no_type_but_comment = 0,
			type_and_inline_comment,
			no_type_and_inline_comment = 0,
			inline_multiline_leading_comment = 'world',
			inline_multiline_trailing_comment = 'world'
		} = $$props;

		$$renderer.push(`<!---->${$.escape(readonly)}
${$.escape(optional)} <input${$.attr('value', binding)}/> <input${$.attr('value', bindingOptional)}/>`);

		$.bind_props($$props, { binding, bindingOptional });
	});
}