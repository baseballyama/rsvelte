import 'svelte/internal/disclose-version';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import * as $ from 'svelte/internal/client';

class Foo {
	id;
	#updateTime = $.state($.proxy(Date.now()));

	get updateTime() {
		return $.get(this.#updateTime);
	}

	set updateTime(value) {
		$.set(this.#updateTime, value, true);
	}

	constructor(id) {
		this.id = id;
	}
}

class Store {
	cache = new SvelteMap();
	#ids = $.state($.proxy([1, 2, 3]));

	get ids() {
		return $.get(this.#ids);
	}

	set ids(value) {
		$.set(this.#ids, value, true);
	}

	getOrDefault(id) {
		let ret = this.cache.get(id);

		if (ret) {
			return ret;
		}

		ret = untrack(() => {
			ret = new Foo(id);
			this.cache.set(id, ret);

			return ret;
		});

		this.cache.get(id);

		return ret;
	}

	get values() {
		return this.ids.map((id) => this.getOrDefault(id)).sort((a, b) => b.updateTime - a.updateTime);
	}
}

const store = new Store();

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const test = $.derived(() => store.values.length);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(test)));
	$.append($$anchor, text);
	$.pop();
}