import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox" name="lang" value="keep"/>`);

export default function Main($$anchor) {
	let to_check = "keep";
	var input = root();

	$.remove_input_defaults(input);
	$.set_checked(input, to_check === "keep");
	$.append($$anchor, input);
}