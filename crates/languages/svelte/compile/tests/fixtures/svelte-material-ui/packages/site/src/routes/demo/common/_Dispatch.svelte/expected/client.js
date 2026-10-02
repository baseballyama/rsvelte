import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dispatch } from '@smui/common/internal';
import Button from '@smui/button';

var root = $.from_html(`<div class="event svelte-1fiqzkp">I'm the event listener. <div class="event svelte-1fiqzkp"><div class="event svelte-1fiqzkp"><div class="event svelte-1fiqzkp">I'm the event target.</div></div></div></div> <br/> <!> <pre class="status"> </pre>`, 1);

export default function _Dispatch($$anchor, $$props) {
	$.push($$props, true);

	let target;
	let event = $.state(false);

	function dispatchEvent() {
		dispatch(
			target,
			'MyEvent',
			{
				// This is the event.details object.
				time: new Date().toLocaleTimeString()
			},
			{
				// This is the eventInit object.
				bubbles: true, // this is the default when no eventInit object is provided.
				cancelable: true // you can make it cancelable like this.
			}
		);
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div));
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);

	$.bind_this(div_3, ($$value) => target = $$value, () => target);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var node = $.sibling(div, 4);

	Button(node, {
		onclick: dispatchEvent,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Dispatch Event');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_1, `Caught Event Detail: ${$0 ?? ''}`), [() => $.get(event) && JSON.stringify($.get(event).detail)]);
	$.event('MyEvent', div, (e) => $.set(event, e, true));
	$.append($$anchor, fragment);
	$.pop();
}