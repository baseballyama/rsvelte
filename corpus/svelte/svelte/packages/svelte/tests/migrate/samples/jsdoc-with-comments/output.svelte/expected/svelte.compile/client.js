import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} comment - My wonderful comment
	 * @property {number} another_comment - My wonderful other comment
	 * @property {any} one_line - one line comment
	 * @property {any} no_comment
	 * @property {boolean} type_no_comment
	 * @property {boolean} type_with_comment - One-line declaration with comment
	 * @property {any} [optional] - This is optional
	 * @property {any} inline_commented - this should stay a comment
	 * @property {any} inline_commented_merged - This comment should be merged - with this inline comment
	 * @property {string} [inline_multiline_leading_comment] - this is a same-line leading multiline comment
	 * @property {string} [inline_multiline_trailing_comment] - this is a same-line trailing multiline comment
	 * @property {number} [default_value]
	 * @property {number} [comment_default_value] - This has a comment and an optional value.
	 */
	/** @type {Props} */
	let optional = $.prop($$props, 'optional', 19, () => ({ stuff: true })),
		inline_multiline_leading_comment = $.prop($$props, 'inline_multiline_leading_comment', 3, 'world'),
		inline_multiline_trailing_comment = $.prop($$props, 'inline_multiline_trailing_comment', 3, 'world'),
		default_value = $.prop($$props, 'default_value', 3, 1),
		comment_default_value = $.prop($$props, 'comment_default_value', 3, 1);
}