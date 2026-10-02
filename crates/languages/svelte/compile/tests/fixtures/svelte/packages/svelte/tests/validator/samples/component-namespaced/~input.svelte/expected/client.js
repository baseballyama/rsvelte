import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NS from 'some-library';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => NS.Foo, ($$anchor, NS_Foo) => {
		NS_Foo($$anchor, {});
	});

	$.append($$anchor, fragment);
}