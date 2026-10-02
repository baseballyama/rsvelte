import * as $ from 'svelte/internal/server';
import { preventDefault } from '@smui/common/events';
import Button, { Label } from '@smui/button';

export default function _EventsAndModifiers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let eventOutput;
		let eventPhaseOutput;
		let events = [];
		let eventPhases = [];

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

		$$renderer.push(`<div>`);

		Button($$renderer, {
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
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->This Button has Event Listeners`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="event-output svelte-wv4gk8">`);

		const each_array = $.ensure_array_like(events);

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let event = each_array[$$index];

				$$renderer.push(`<p>Caught ${$.escape(event)}</p>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p>No events yet.</p>`);
		}

		$$renderer.push(`<!--]--></div> <div>Try clicking and using the Enter key to activate this next button. (The click
  event's target is an element below the button while the key event's target is
  the button.)</div> <div>`);

		Button($$renderer, {
			onclickcapture: addEventPhase,
			onclick: addEventPhase,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Capture and Bubble Phase Listeners`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="event-output svelte-wv4gk8">`);

		const each_array_1 = $.ensure_array_like(eventPhases);

		if (each_array_1.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let event = each_array_1[$$index_1];

				$$renderer.push(`<p>Caught ${$.escape(event[0].type)} in ${$.escape(event[1])} phase</p>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p>No events yet.</p>`);
		}

		$$renderer.push(`<!--]--></div> <br/> <br/> <div>Standard events can be modified, like blocking navigation on the click event
  of a link.</div> <div>`);

		Button($$renderer, {
			href: 'http://example.com',
			onclick: preventDefault(() => console.log("You tried to go, but didn't make it.")),
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->A Link, with Default Prevented`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}