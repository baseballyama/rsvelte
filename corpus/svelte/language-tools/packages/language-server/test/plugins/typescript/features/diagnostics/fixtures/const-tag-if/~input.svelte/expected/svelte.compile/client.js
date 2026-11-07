import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <button></button>`, 1);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	let value;

	function handleClick() {
		value = 'hello';
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const valueStr = $.derived(() => value);
			const valueStr2 = $.derived(() => $.get(valueStr));
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var text = $.only_child(div);
			var button = $.sibling(div, 2);

			$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}${$1 ?? ''}`), [
				() => $.get(valueStr).substring(0),
				() => $.get(valueStr2).substring(0)
			]);

			$.event('click', button, () => {
				$.get(valueStr).substring(0) && handleClick();
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), [() => value.toFixed()]);
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (typeof value === 'string') $$render(consequent); else if (typeof value === 'number') $$render(consequent_1, 1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			const valueStr = $.derived(() => value);
			const valueStr2 = $.derived(() => $.get(valueStr));
			var div_1 = root_1();
			var text_2 = $.only_child(div_1);

			$.template_effect(($0, $1) => $.set_text(text_2, `${$0 ?? ''}${$1 ?? ''}`), [
				() => $.get(valueStr).toFixed(),
				() => $.get(valueStr2).toFixed()
			]);

			$.append($$anchor, div_1);
		};

		var consequent_3 = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(($0) => $.set_text(text_3, $0), [() => value.substring(0)]);
			$.append($$anchor, text_3);
		};

		var alternate = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(($0) => $.set_text(text_4, $0), [() => value.toFixed()]);
			$.append($$anchor, text_4);
		};

		$.if(node_1, ($$render) => {
			if (typeof value === 'string') $$render(consequent_2); else if (typeof value === 'number') $$render(consequent_3, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}