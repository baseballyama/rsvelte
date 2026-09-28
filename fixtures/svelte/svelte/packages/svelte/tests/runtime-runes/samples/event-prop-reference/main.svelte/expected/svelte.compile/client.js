import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function onclick() {
		console.log($$props.item?.name);
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $$props.item?.name));
	$.delegated('click', button, onclick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);