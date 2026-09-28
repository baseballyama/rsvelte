import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <!> <div><button>click me</button> <button>click me</button> <button>click me</button></div>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);
	var button_7 = $.sibling(button_6, 2);
	var button_8 = $.sibling(button_7, 2);
	var button_9 = $.sibling(button_8, 2);
	var button_10 = $.sibling(button_9, 2);
	var button_11 = $.sibling(button_10, 2);
	var button_12 = $.sibling(button_11, 2);
	var button_13 = $.sibling(button_12, 2);
	var button_14 = $.sibling(button_13, 2);
	var button_15 = $.sibling(button_14, 2);
	var button_16 = $.sibling(button_15, 2);
	var button_17 = $.sibling(button_16, 2);
	var button_18 = $.sibling(button_17, 2);
	var button_19 = $.sibling(button_18, 2);
	var button_20 = $.sibling(button_19, 2);
	var button_21 = $.sibling(button_20, 2);
	var button_22 = $.sibling(button_21, 2);
	var button_23 = $.sibling(button_22, 2);
	var button_24 = $.sibling(button_23, 2);
	var button_25 = $.sibling(button_24, 2);
	var button_26 = $.sibling(button_25, 2);
	var button_27 = $.sibling(button_26, 2);
	var button_28 = $.sibling(button_27, 2);
	var button_29 = $.sibling(button_28, 2);
	var button_30 = $.sibling(button_29, 2);
	var button_31 = $.sibling(button_30, 2);
	var button_32 = $.sibling(button_31, 2);
	var button_33 = $.sibling(button_32, 2);
	var button_34 = $.sibling(button_33, 2);
	var node = $.sibling(button_34, 2);

	Button(node, {
		$$events: {
			click: [
				() => 'leave untouched',
				function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				}
			]
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('click me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var button_35 = $.child(div);
	var button_36 = $.sibling(button_35, 2);
	var button_37 = $.sibling(button_36, 2);

	$.reset(div);
	$.event('click', button, () => console.log('hi'));

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_1, function () {
		console.log('hi');
	});

	$.event('click', button_1, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_2, () => console.log('before'));

	$.event('click', button_2, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_2, () => console.log('after'));

	$.event('click', button_3, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_3, foo);

	$.event('click', button_4, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('dblclick', button_5, () => console.log('hi'));

	$.event('toggle', button_6, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('custom-event', button_7, () => 'hi');

	$.event('custom-event-bubble', button_8, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_9, $.preventDefault(() => searching = true));
	$.event('click', button_10, $.preventDefault(() => ''));
	$.event('click', button_11, $.stopPropagation(() => {}));
	$.event('click', button_12, $.stopImmediatePropagation(() => ''));
	$.event('click', button_13, () => '', true);
	$.event('click', button_14, $.self(() => ''));
	$.event('click', button_15, $.trusted(() => ''));
	$.event('click', button_16, $.once(() => ''));
	$.event('click', button_17, $.preventDefault($.stopPropagation(() => '')));
	$.event('click', button_18, $.stopImmediatePropagation($.stopPropagation(() => {})));
	$.event('click', button_19, $.self($.stopImmediatePropagation(() => '')));
	$.event('click', button_20, $.trusted($.self(() => '')));
	$.event('click', button_21, $.trusted($.self(() => '')));
	$.event('click', button_22, $.once($.trusted(() => '')));
	$.event('click', button_23, $.once($.preventDefault(() => '')));

	$.event(
		'click',
		button_24,
		function ($$arg) {
			$.bubble_event.call(this, $$props, $$arg);
		},
		void 0,
		true
	);

	$.event(
		'click',
		button_25,
		function ($$arg) {
			$.bubble_event.call(this, $$props, $$arg);
		},
		void 0,
		false
	);

	$.event('click', button_26, () => '', void 0, true);
	$.event('click', button_27, () => '', void 0, false);
	$.event('click', button_28, foo, void 0, true);
	$.event('click', button_29, foo, void 0, false);
	$.event('click', button_30, $.stopPropagation(() => ''), void 0, true);
	$.event('click', button_31, $.trusted(() => ''), void 0, false);
	$.event('click', button_32, () => '', void 0, true);

	$.event('click', button_32, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_32, () => '');
	$.event('click', button_33, () => '', void 0, false);

	$.event('click', button_33, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_33, () => {
		return 'multiline';
	});

	$.event('click', button_34, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_34, foo);
	$.event('blur', button_34, foo);
	$.event('click', button_34, () => '');
	$.event('click', button_34, $.once($.trusted($.preventDefault(() => ''))));

	$.event('blur', button_34, $.once($.trusted($.preventDefault(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}))));

	$.event('click', button_35, () => {
		console.log('hi');
	});

	$.event('click', button_36, $.preventDefault(() => {
		console.log('hi');
	}));

	$.event('click', button_37, $.preventDefault(() => count += 1));
	$.append($$anchor, fragment);
}