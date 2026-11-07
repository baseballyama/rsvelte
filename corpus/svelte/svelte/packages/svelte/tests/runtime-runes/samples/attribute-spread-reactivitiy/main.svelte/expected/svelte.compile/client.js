import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <!> <!> <!> <button>toggle</button>`, 1);

export default function Main($$anchor) {
	let value = $.state('red');
	let tag = 'div';

	const getValue = () => {
		return $.get(value);
	};

	const getClass = () => {
		return $.get(value) === 'blue';
	};

	const getSpread = () => {
		return { class: $.get(value) };
	};

	const props = {
		get class() {
			return $.get(value);
		}
	};

	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	let styles;
	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, ($0) => ({ ...$0 }), [() => getSpread()]);

	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ ...props }));

	var node = $.sibling(div_2, 2);

	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect(
			$$element,
			($0, $1) => ({
				class: '',
				style: '',
				[$.CLASS]: { blue: $0 },
				[$.STYLE]: { color: $1 }
			}),
			[() => getClass(), () => getValue()]
		);
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, ($0) => ({ ...$0 }), [() => getSpread()]);
	});

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => tag, false, ($$element_2, $$anchor) => {
		$.attribute_effect($$element_2, () => ({ ...props }));
	});

	var button = $.sibling(node_2, 2);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(div, 1, '', null, classes, { blue: $0 });
			styles = $.set_style(div, '', styles, { color: $1 });
		},
		[() => getClass(), () => getValue()]
	);

	$.event('click', button, () => $.set(value, 'blue'));
	$.append($$anchor, fragment);
}