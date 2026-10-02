import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

class Foo {
	id;
	updateTime = Date.now();

	constructor(id) {
		this.id = id;
	}
}

class Store {
	cache = new SvelteMap();
	ids = [1, 2, 3];

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

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const test = $.derived(() => store.values.length);

		$$renderer.push(`<!---->${$.escape(test())}`);
	});
}