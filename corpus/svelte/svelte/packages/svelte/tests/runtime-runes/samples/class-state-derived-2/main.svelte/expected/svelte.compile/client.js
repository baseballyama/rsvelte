import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state(0);

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}

		#doubled = $.derived(() => this.count * 2);

		get doubled() {
			return $.get(this.#doubled);
		}

		set doubled(value) {
			$.set(this.#doubled, value);
		}

		constructor(initialCount = 0) {
			this.count = initialCount;
		}
	}

	const counter = new Counter(1);

	var $$exports = {
		get Counter() {
			return Counter;
		},

		set Counter($$value) {
			Counter = $$value;
		}
	};

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, counter.doubled));
	$.append($$anchor, text);

	return $.pop($$exports);
}