import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo, { Bar } from './Somewhere.svelte';
import Baz from './somewhereelse';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let Buzz;

	new Foo({ target: null });
	new Foo({}); // also a false negative to be really sure we don't get false positives
	new Foo();
	new Bar();
	new Baz();
	new Buzz();
	$.pop();
}