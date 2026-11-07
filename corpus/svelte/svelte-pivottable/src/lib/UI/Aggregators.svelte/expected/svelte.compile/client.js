import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "./Dropdown.svelte";

var root = $.from_html(`<br/>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!>   <!> <!>`, 1);

export default function Aggregators($$anchor, $$props) {
	$.push($$props, true);

	let numValsAllowed = $.derived(() => $$props.aggregators[$$props.aggregatorName]([])().numInputs || 0);

	const sortIcons = {
		key_a_to_z: { rowSymbol: "↕", colSymbol: "↔", next: "value_a_to_z" },
		value_a_to_z: { rowSymbol: "↓", colSymbol: "→", next: "value_z_to_a" },
		value_z_to_a: { rowSymbol: "↑", colSymbol: "←", next: "key_a_to_z" }
	};

	// is it a time to use array.toSpliced(index, 1, value); ?
	const setAt = (array, index, value) => Object.assign([], array, { [index]: value });

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => Object.keys($$props.aggregators));

		Dropdown(node, {
			get current() {
				return $$props.aggregatorName;
			},

			get values() {
				return $.get($0);
			},

			get onchange() {
				return $$props.onChange;
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var br = root();

			$.append($$anchor, br);
		};

		$.if(node_1, ($$render) => {
			if ($.get(numValsAllowed) > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => new Array($.get(numValsAllowed)), $.index, ($$anchor, n, i) => {
		var fragment_1 = root_1();
		var node_3 = $.first_child(fragment_1);

		Dropdown(node_3, {
			get current() {
				return $$props.vals[i];
			},

			get values() {
				return $$props.valAttrs;
			},
			onchange: (v) => $$props.onUpdate(setAt($$props.vals, i, v))
		});

		var node_4 = $.sibling(node_3, 2);

		{
			var consequent_1 = ($$anchor) => {
				var br_1 = root();

				$.append($$anchor, br_1);
			};

			$.if(node_4, ($$render) => {
				if (i + 1 !== $.get(numValsAllowed)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}