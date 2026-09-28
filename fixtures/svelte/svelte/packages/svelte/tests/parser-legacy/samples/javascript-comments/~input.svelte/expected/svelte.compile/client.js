import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> `, 1);

export default function Input($$anchor) {
	// a leading comment
	const a = 1; // a trailing comment

	const b = 2;

	/** a comment */
	function asd() {
		foo; // trailing

		/* leading comment 1 */
		/* leading comment 2 */
		/* leading comment 3 */
		bar;

		/* trailing comment 1 */
		/* trailing comment 2 */
		/* trailing comment 3 */
	}

	const array = [
		// leading comment 1
		// leading comment 2
		1 // trailing comment 1

		/* trailing comment 2 */
	];

	const object = {
		// leading comment 1
		// leading comment 2
		a: 1 // trailing comment 1

		/* trailing comment 2 */
	};

	var fragment = root();
	var button = $.first_child(fragment);

	button.textContent = '1';

	var text = $.sibling(button);

	text.nodeValue = ' 3';

	$.event(
		'click',
		button,
		// comment
		() => {
			/* another comment */
			fn(); // a trailing comment

			/* trailing block comment */
		}
	);

	$.append($$anchor, fragment);
}