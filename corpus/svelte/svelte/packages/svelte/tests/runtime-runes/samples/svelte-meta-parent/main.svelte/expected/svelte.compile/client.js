import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./child.svelte";
import Passthrough from "./passthrough.svelte";

var root = $.from_html(`<p>if</p>`);
var root_1 = $.from_html(`<p>each</p>`);
var root_2 = $.from_html(`<p>await</p>`);
var root_3 = $.from_html(`<p>loading</p>`);
var root_4 = $.from_html(`<p>key</p>`);
var root_5 = $.from_html(`<p>hi</p>`);
var root_6 = $.from_html(`<p>no parent</p> <button>toggle</button> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let x = { y: Child };
	let key = 'test';
	let show = $.state(true);
	var fragment = root_6();
	var button = $.sibling($.first_child(fragment), 2);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => [1], $.index, ($$anchor, $$item) => {
		var p_1 = root_1();

		$.append($$anchor, p_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => Promise.resolve(),
		($$anchor) => {
			var p_3 = root_3();

			$.append($$anchor, p_3);
		},
		($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.key(node_3, () => key, ($$anchor) => {
		var p_4 = root_4();

		$.append($$anchor, p_4);
	});

	var node_4 = $.sibling(node_3, 2);

	Child(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	Passthrough(node_5, {
		children: ($$anchor, $$slotProps) => {
			Child($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Passthrough(node_6, {
		children: ($$anchor, $$slotProps) => {
			Passthrough($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Child($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				const named = ($$anchor) => {
					var p_5 = root_5();

					$.append($$anchor, p_5);
				};

				Passthrough($$anchor, { named, $$slots: { named: true } });
			}
		};

		$.if(node_7, ($$render) => {
			if ($.get(show)) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => x.y, ($$anchor, x_y) => {
		x_y($$anchor, {});
	});

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);