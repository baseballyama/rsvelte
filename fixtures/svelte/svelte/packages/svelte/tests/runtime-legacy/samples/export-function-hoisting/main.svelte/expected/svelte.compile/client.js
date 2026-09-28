import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function one() {
		two();
	}

	function two() {
		return one();
	}

	var $$exports = { one, two };

	$.next();

	var text = $.text('Compile plz');

	$.append($$anchor, text);

	return $.pop($$exports);
}