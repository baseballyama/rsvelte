import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let method = 'method';

	function submitPay() {
		console.log(method);
	}

	let methods = [{ method: 1 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => methods, $.index, ($$anchor, $$item, $$index, $$array) => {
		let method = () => $.get($$item).method;
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => $.set_text(text, method()));
		$.delegated('click', button, submitPay);
		$.append($$anchor, button);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);