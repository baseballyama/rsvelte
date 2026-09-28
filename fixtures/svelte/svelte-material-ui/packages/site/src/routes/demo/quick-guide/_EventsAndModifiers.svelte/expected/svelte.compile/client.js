import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preventDefault } from '@smui/common/events';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>No events yet.</p>`);

var root_2 = $.from_html(
	`<div><!></div> <div class="event-output svelte-wv4gk8"></div> <div>Try clicking and using the Enter key to activate this next button. (The click
  event's target is an element below the button while the key event's target is
  the button.)</div> <div><!></div> <div class="event-output svelte-wv4gk8"></div> <br/> <br/> <div>Standard events can be modified, like blocking navigation on the click event
  of a link.</div> <div><!></div>`,
	1
);

export default function _EventsAndModifiers($$anchor, $$props) {
	$.push($$props, true);

	let eventOutput;
	let eventPhaseOutput;
	let events = $.proxy([]);
	let eventPhases = $.proxy([]);

	function addEvent(event) {
		if (events.length && (events[events.length - 1] === event.type || events[events.length - 1].startsWith(event.type))) {
			const current = parseInt(events[events.length - 1].replace(/\D/g, ''));

			events[events.length - 1] = `${event.type} ×${isNaN(current) ? 2 : current + 1}`;
		} else {
			events.push(event.type);
		}

		requestAnimationFrame(() => {
			eventOutput.scrollTop = eventOutput.scrollHeight;
		});
	}

	function addEventPhase(event) {
		const phases = ['none', 'capturing', 'at-target', 'bubbling'];

		eventPhases.push([event, phases[event.eventPhase]]);

		requestAnimationFrame(() => {
			eventPhaseOutput.scrollTop = eventPhaseOutput.scrollHeight;
		});
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: addEvent,
		onmousedown: addEvent,
		onmouseup: addEvent,
		onmouseover: addEvent,
		onmousemove: addEvent,
		onmouseout: addEvent,
		onkeypress: addEvent,
		onkeydown: addEvent,
		onkeyup: addEvent,
		onfocus: addEvent,
		onblur: addEvent,
		onanimationstart: addEvent,
		onanimationend: addEvent,
		ontouchstart: addEvent,
		ontouchend: addEvent,
		ontouchmove: addEvent,
		ontouchcancel: addEvent,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This Button has Event Listeners');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(
		div_1,
		21,
		() => events,
		$.index,
		($$anchor, event) => {
			var p = root();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Caught ${$.get(event) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		}
	);

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => eventOutput = $$value, () => eventOutput);

	var div_2 = $.sibling(div_1, 4);
	var node_1 = $.child(div_2);

	Button(node_1, {
		onclickcapture: addEventPhase,
		onclick: addEventPhase,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Capture and Bubble Phase Listeners');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);

	$.each(
		div_3,
		21,
		() => eventPhases,
		$.index,
		($$anchor, event) => {
			var p_2 = root();
			var text_3 = $.only_child(p_2);

			$.template_effect(() => $.set_text(text_3, `Caught ${$.get(event)[0].type ?? ''} in ${$.get(event)[1] ?? ''} phase`));
			$.append($$anchor, p_2);
		},
		($$anchor) => {
			var p_3 = root_1();

			$.append($$anchor, p_3);
		}
	);

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => eventPhaseOutput = $$value, () => eventPhaseOutput);

	var div_4 = $.sibling(div_3, 8);
	var node_2 = $.child(div_4);

	{
		let $0 = $.derived(() => preventDefault(() => console.log("You tried to go, but didn't make it.")));

		Button(node_2, {
			href: 'http://example.com',
			get onclick() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('A Link, with Default Prevented');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.append($$anchor, fragment);
	$.pop();
}