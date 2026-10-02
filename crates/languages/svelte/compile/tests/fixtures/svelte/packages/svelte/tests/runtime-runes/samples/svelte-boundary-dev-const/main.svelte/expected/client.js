import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>BOOM</p>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let ok = $.prop($$props, 'ok', 3, true);

	function throwError() {
		throw new Error();
	}

	function throwErrorOnUpdate() {
		if (ok()) {
			return "OK";
		} else {
			throwError();
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var div = root_1();
			var text = $.only_child(div, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => throwError()]);
			$.append($$anchor, div);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const failed = ($$anchor) => {
			const result = $.derived(throwError);
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		$.boundary(node_1, { failed }, ($$anchor) => {
			const result = $.derived(throwError);
			var div_1 = root_1();
			var text_1 = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(result)));
			$.append($$anchor, div_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const failed = ($$anchor) => {
			var p_2 = root();

			$.append($$anchor, p_2);
		};

		$.boundary(node_2, { failed }, ($$anchor) => {
			var div_2 = root_1();
			var text_2 = $.only_child(div_2, true);

			$.template_effect(($0) => $.set_text(text_2, $0), [() => throwErrorOnUpdate()]);
			$.append($$anchor, div_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const failed = ($$anchor) => {
			const result = $.derived(throwErrorOnUpdate);
			var p_3 = root();

			$.append($$anchor, p_3);
		};

		$.boundary(node_3, { failed }, ($$anchor) => {
			const result = $.derived(throwErrorOnUpdate);
			var div_3 = root_1();
			var text_3 = $.only_child(div_3, true);

			$.template_effect(() => $.set_text(text_3, $.get(result)));
			$.append($$anchor, div_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}