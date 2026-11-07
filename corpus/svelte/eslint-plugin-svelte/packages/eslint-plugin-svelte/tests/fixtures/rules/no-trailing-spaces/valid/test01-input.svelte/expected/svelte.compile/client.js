import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>Text</span> <span>Text</span> <span>Text</span>`, 1);

export default function Test01_input($$anchor) {
	const str = `
  
`;

	// line comment
	/**
	 * block comment
	 */
	/**
	 * block comment2
	 */
	const a = 42;

	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
	// empty line
	// empty line
}