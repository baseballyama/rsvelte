import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { createSubscriber } from 'svelte/reactivity';

var root = $.from_html(`<div class="container"><div class="box box1 svelte-tpp10s"></div> <div class="box box2 svelte-tpp10s"></div> <label class="svelte-tpp10s"><span>Time:</span> <input type="range"/></label></div>`);

export default function Reactive_events($$anchor, $$props) {
	$.push($$props, true);

	class Timeline {
		#timeline = window.gsap.timeline();
		#subscribe;

		constructor(tweens) {
			this.populateTimeline(tweens);

			this.#subscribe = createSubscriber((update) => {
				this.#timeline.eventCallback('onUpdate', update);

				return () => this.#timeline.eventCallback('onUpdate', null);
			});
		}

		populateTimeline(tweens) {
			onMount(() => {
				tweens.forEach(([element, vars]) => {
					this.#timeline.to(element, vars);
				});
			});
		}

		get time() {
			// makes it reactive when read inside an effect
			this.#subscribe();

			return this.#timeline.time();
		}

		set time(v) {
			this.#timeline.seek(v);
		}
	}

	const tl = new Timeline([
		['.box1', { x: 200, duration: 1 }],
		['.box2', { x: 200, duration: 1 }]
	]);

	var div = root();
	var label = $.sibling($.child(div), 4);
	var input = $.sibling($.child(label), 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 2);
	$.set_attribute(input, 'step', 0.01);
	$.reset(label);
	$.reset(div);
	$.bind_value(input, () => tl.time, ($$value) => tl.time = $$value);
	$.append($$anchor, div);
	$.pop();
}