import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "./Button.svelte";

import {
	createBubbler,
	handlers,
	preventDefault,
	stopPropagation,
	stopImmediatePropagation,
	self,
	trusted,
	once,
	passive,
	nonpassive
} from 'svelte/legacy';

var root = $.from_html(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <!> <div><button>click me</button> <button>click me</button> <button>click me</button></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const bubble = createBubbler();
	var fragment = root();
	var button = $.first_child(fragment);
	var event_handler = $.derived(() => handlers(() => console.log('hi'), bubble('click')));
	var button_1 = $.sibling(button, 2);

	var event_handler_1 = $.derived(() => handlers(
		function () {
			console.log('hi');
		},
		bubble('click')
	));

	var button_2 = $.sibling(button_1, 2);
	var event_handler_2 = $.derived(() => handlers(() => console.log('before'), bubble('click'), () => console.log('after')));
	var button_3 = $.sibling(button_2, 2);
	var event_handler_3 = $.derived(() => handlers(bubble('click'), foo));
	var button_4 = $.sibling(button_3, 2);
	var event_handler_4 = $.derived(() => bubble('click'));
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);
	var event_handler_5 = $.derived(() => bubble('toggle'));
	var button_7 = $.sibling(button_6, 2);
	var button_8 = $.sibling(button_7, 2);
	var event_handler_6 = $.derived(() => bubble('custom-event-bubble'));
	var button_9 = $.sibling(button_8, 2);
	var event_handler_7 = $.derived(() => preventDefault(() => searching = true));
	var button_10 = $.sibling(button_9, 2);
	var event_handler_8 = $.derived(() => preventDefault(() => ''));
	var button_11 = $.sibling(button_10, 2);
	var event_handler_9 = $.derived(() => stopPropagation(() => {}));
	var button_12 = $.sibling(button_11, 2);
	var event_handler_10 = $.derived(() => stopImmediatePropagation(() => ''));
	var button_13 = $.sibling(button_12, 2);
	var button_14 = $.sibling(button_13, 2);
	var event_handler_11 = $.derived(() => self(() => ''));
	var button_15 = $.sibling(button_14, 2);
	var event_handler_12 = $.derived(() => trusted(() => ''));
	var button_16 = $.sibling(button_15, 2);
	var event_handler_13 = $.derived(() => once(() => ''));
	var button_17 = $.sibling(button_16, 2);
	var event_handler_14 = $.derived(() => stopPropagation(preventDefault(() => '')));
	var button_18 = $.sibling(button_17, 2);
	var event_handler_15 = $.derived(() => stopImmediatePropagation(stopPropagation(() => {})));
	var button_19 = $.sibling(button_18, 2);
	var event_handler_16 = $.derived(() => self(stopImmediatePropagation(() => '')));
	var button_20 = $.sibling(button_19, 2);
	var event_handler_17 = $.derived(() => trusted(self(() => '')));
	var button_21 = $.sibling(button_20, 2);
	var event_handler_18 = $.derived(() => trusted(self(() => '')));
	var button_22 = $.sibling(button_21, 2);
	var event_handler_19 = $.derived(() => once(trusted(() => '')));
	var button_23 = $.sibling(button_22, 2);
	var event_handler_20 = $.derived(() => once(preventDefault(() => '')));
	var button_24 = $.sibling(button_23, 2);

	$.action(button_24, ($$node, $$action_arg) => passive?.($$node, $$action_arg), () => ['click', () => bubble('click')]);

	var button_25 = $.sibling(button_24, 2);

	$.action(button_25, ($$node, $$action_arg) => nonpassive?.($$node, $$action_arg), () => ['click', () => bubble('click')]);

	var button_26 = $.sibling(button_25, 2);

	$.action(button_26, ($$node, $$action_arg) => passive?.($$node, $$action_arg), () => ['click', () => () => '']);

	var button_27 = $.sibling(button_26, 2);

	$.action(button_27, ($$node, $$action_arg) => nonpassive?.($$node, $$action_arg), () => ['click', () => () => '']);

	var button_28 = $.sibling(button_27, 2);

	$.action(button_28, ($$node, $$action_arg) => passive?.($$node, $$action_arg), () => ['click', () => foo]);

	var button_29 = $.sibling(button_28, 2);

	$.action(button_29, ($$node, $$action_arg) => nonpassive?.($$node, $$action_arg), () => ['click', () => foo]);

	var button_30 = $.sibling(button_29, 2);

	$.action(button_30, ($$node, $$action_arg) => passive?.($$node, $$action_arg), () => ['click', () => stopPropagation(() => '')]);

	var button_31 = $.sibling(button_30, 2);

	$.action(button_31, ($$node, $$action_arg) => nonpassive?.($$node, $$action_arg), () => ['click', () => trusted(() => '')]);

	var button_32 = $.sibling(button_31, 2);
	var event_handler_21 = $.derived(() => handlers(bubble('click'), () => ''));

	$.action(button_32, ($$node, $$action_arg) => passive?.($$node, $$action_arg), () => ['click', () => () => '']);

	var button_33 = $.sibling(button_32, 2);

	var event_handler_22 = $.derived(() => handlers(bubble('click'), () => {
		return 'multiline';
	}));

	$.action(button_33, ($$node, $$action_arg) => nonpassive?.($$node, $$action_arg), () => ['click', () => () => '']);

	var button_34 = $.sibling(button_33, 2);
	var event_handler_23 = $.derived(() => handlers(bubble('click'), foo, () => '', once(trusted(preventDefault(() => '')))));
	var event_handler_24 = $.derived(() => handlers(foo, once(trusted(preventDefault(bubble('blur'))))));
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

	var event_handler_25 = $.derived(() => preventDefault(() => {
		console.log('hi');
	}));

	var button_37 = $.sibling(button_36, 2);
	var event_handler_26 = $.derived(() => preventDefault(() => count += 1));

	$.reset(div);

	$.delegated('click', button, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		$.get(event_handler_1)?.apply(this, $$args);
	});

	$.delegated('click', button_2, function (...$$args) {
		$.get(event_handler_2)?.apply(this, $$args);
	});

	$.delegated('click', button_3, function (...$$args) {
		$.get(event_handler_3)?.apply(this, $$args);
	});

	$.delegated('click', button_4, function (...$$args) {
		$.get(event_handler_4)?.apply(this, $$args);
	});

	$.delegated('dblclick', button_5, () => console.log('hi'));

	$.event('toggle', button_6, function (...$$args) {
		$.get(event_handler_5)?.apply(this, $$args);
	});

	$.event('custom-event', button_7, () => 'hi');

	$.event('custom-event-bubble', button_8, function (...$$args) {
		$.get(event_handler_6)?.apply(this, $$args);
	});

	$.delegated('click', button_9, function (...$$args) {
		$.get(event_handler_7)?.apply(this, $$args);
	});

	$.delegated('click', button_10, function (...$$args) {
		$.get(event_handler_8)?.apply(this, $$args);
	});

	$.delegated('click', button_11, function (...$$args) {
		$.get(event_handler_9)?.apply(this, $$args);
	});

	$.delegated('click', button_12, function (...$$args) {
		$.get(event_handler_10)?.apply(this, $$args);
	});

	$.event('click', button_13, () => '', true);

	$.delegated('click', button_14, function (...$$args) {
		$.get(event_handler_11)?.apply(this, $$args);
	});

	$.delegated('click', button_15, function (...$$args) {
		$.get(event_handler_12)?.apply(this, $$args);
	});

	$.delegated('click', button_16, function (...$$args) {
		$.get(event_handler_13)?.apply(this, $$args);
	});

	$.delegated('click', button_17, function (...$$args) {
		$.get(event_handler_14)?.apply(this, $$args);
	});

	$.delegated('click', button_18, function (...$$args) {
		$.get(event_handler_15)?.apply(this, $$args);
	});

	$.delegated('click', button_19, function (...$$args) {
		$.get(event_handler_16)?.apply(this, $$args);
	});

	$.delegated('click', button_20, function (...$$args) {
		$.get(event_handler_17)?.apply(this, $$args);
	});

	$.delegated('click', button_21, function (...$$args) {
		$.get(event_handler_18)?.apply(this, $$args);
	});

	$.delegated('click', button_22, function (...$$args) {
		$.get(event_handler_19)?.apply(this, $$args);
	});

	$.delegated('click', button_23, function (...$$args) {
		$.get(event_handler_20)?.apply(this, $$args);
	});

	$.delegated('click', button_32, function (...$$args) {
		$.get(event_handler_21)?.apply(this, $$args);
	});

	$.delegated('click', button_33, function (...$$args) {
		$.get(event_handler_22)?.apply(this, $$args);
	});

	$.delegated('click', button_34, function (...$$args) {
		$.get(event_handler_23)?.apply(this, $$args);
	});

	$.event('blur', button_34, function (...$$args) {
		$.get(event_handler_24)?.apply(this, $$args);
	});

	$.delegated('click', button_35, () => {
		console.log('hi');
	});

	$.delegated('click', button_36, function (...$$args) {
		$.get(event_handler_25)?.apply(this, $$args);
	});

	$.delegated('click', button_37, function (...$$args) {
		$.get(event_handler_26)?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'dblclick']);