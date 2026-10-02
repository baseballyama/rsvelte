import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>add prop</button>`);

export default function Main($$anchor) {
	let obj = $.proxy({});
	let array = $.proxy([]);

	;;
	;;

	var button = root();

	$.delegated('click', button, () => {
		obj.x = "hello";
		array[0] = "hello";
	});

	$.append($$anchor, button);
}

$.delegate(['click']);