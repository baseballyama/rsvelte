import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!> <!> <!>`, 1);

export default function Input($$anchor) {
	const value = true;
	const items = [1, 2, 3];

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		const getter = $.derived(() => () => $.get(item));

		$.next();

		var text_1 = $.text();

		$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(getter)()]);
		$.append($$anchor, text_1);
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor) => {
			Child($$anchor, { value });
		};

		Component(node_1, { children, $$slots: { default: true } });
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let data = () => ($$arg0?.()).data;

			Child($$anchor, {
				get data() {
					return data();
				}
			});
		};

		Component(node_2, { children, $$slots: { default: true } });
	}

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} `), [() => items.map((item) => item)]);
	$.append($$anchor, fragment);
}