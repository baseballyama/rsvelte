import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export class Thing {
	#data = $.state();

	get data() {
		return $.get(this.#data);
	}

	set data(value) {
		$.set(this.#data, value, true);
	}

	subscribe() {
		queueMicrotask(() => {
			this.data = { name: `Zeeba Neighba` };
		});
	}

	#name = $.derived(() => this.data?.name);

	get name() {
		return $.get(this.#name);
	}

	set name(value) {
		$.set(this.#name, value);
	}
}

export class Things {
	#thing = $.state();

	get thing() {
		return $.get(this.#thing);
	}

	set thing(value) {
		$.set(this.#thing, value, true);
	}

	subscribe() {
		queueMicrotask(() => {
			this.thing = new Thing();
			this.thing.subscribe();
			this.thing.name;
		});
	}
}

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let model = new Things();

	$.user_effect(() => model.subscribe());

	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, model.thing?.name));
	$.append($$anchor, div);
	$.pop();
}