import * as $ from 'svelte/internal/server';

export class Thing {
	data;

	subscribe() {
		queueMicrotask(() => {
			this.data = { name: `Zeeba Neighba` };
		});
	}

	#name = $.derived(() => this.data?.name);

	get name() {
		return this.#name();
	}

	set name($$value) {
		return this.#name($$value);
	}
}

export class Things {
	thing;

	subscribe() {
		queueMicrotask(() => {
			this.thing = new Thing();
			this.thing.subscribe();
			this.thing.name;
		});
	}
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let model = new Things();

		$$renderer.push(`<div>${$.escape(model.thing?.name)}</div>`);
	});
}