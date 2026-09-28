import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input type="checkbox" name="flavours"/> `, 1);
var root_1 = $.from_html(`<form method="POST"><input type="radio" name="scoops"/> One scoop <input type="radio" name="scoops"/> Two scoops <input type="radio" name="scoops"/> Three scoops <!></form> <div id="output"> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $order = () => $.store_get(order, '$order', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	const binding_group_1 = [];
	let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];
	let order = writable({ flavours: ['Mint choc chip'], scoops: 1 });
	var fragment = root_1();
	var form = $.first_child(fragment);
	var input = $.child(form);

	$.remove_input_defaults(input);
	input.value = input.__value = 1;

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 2;

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 3;

	var node = $.sibling(input_2, 2);

	$.each(node, 17, () => menu, $.index, ($$anchor, flavour) => {
		var fragment_1 = root();
		var input_3 = $.first_child(fragment_1);

		$.remove_input_defaults(input_3);

		var input_3_value;
		var text = $.sibling(input_3);

		$.template_effect(() => {
			if (input_3_value !== (input_3_value = $.get(flavour))) {
				input_3.value = (input_3.__value = input_3_value) ?? '';
			}

			$.set_text(text, ` ${$.get(flavour) ?? ''}`);
		});

		$.bind_group(
			binding_group_1,
			[],
			input_3,
			() => {
				$.get(flavour);

				return $order().flavours;
			},
			($$value) => $.store_mutate(order, $.untrack($order).flavours = $$value, $.untrack($order))
		);

		$.append($$anchor, fragment_1);
	});

	$.reset(form);

	var div = $.sibling(form, 2);
	var text_1 = $.only_child(div, true);

	$.template_effect(($0) => $.set_text(text_1, $0), [() => $order().flavours.join('+')]);

	$.bind_group(
		binding_group,
		[],
		input,
		() => {
			1;

			return $order().scoops;
		},
		($$value) => $.store_mutate(order, $.untrack($order).scoops = $$value, $.untrack($order))
	);

	$.bind_group(
		binding_group,
		[],
		input_1,
		() => {
			2;

			return $order().scoops;
		},
		($$value) => $.store_mutate(order, $.untrack($order).scoops = $$value, $.untrack($order))
	);

	$.bind_group(
		binding_group,
		[],
		input_2,
		() => {
			3;

			return $order().scoops;
		},
		($$value) => $.store_mutate(order, $.untrack($order).scoops = $$value, $.untrack($order))
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}