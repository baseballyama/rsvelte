import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	$.attribute_effect(p, () => ({
		...{ id: "my-id", style: "width: 65px" },
		[$.STYLE]: { color: 'blue' }
	}));

	$.append($$anchor, p);
}