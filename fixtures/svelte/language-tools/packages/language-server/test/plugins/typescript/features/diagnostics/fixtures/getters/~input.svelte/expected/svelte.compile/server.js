import * as $ from 'svelte/internal/server';
import ComponentWithGetters from "./component-with-getters.svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const comp = null;

		comp.test();
		new comp.Foo();
		comp.bar === 'foo';
	});
}