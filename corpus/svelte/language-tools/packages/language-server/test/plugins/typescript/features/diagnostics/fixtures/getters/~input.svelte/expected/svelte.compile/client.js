import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentWithGetters from "./component-with-getters.svelte";

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const comp = null;

	comp.test();
	new comp.Foo();
	comp.bar === 'foo';
	$.pop();
}