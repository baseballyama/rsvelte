import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useAddProvider } from './add.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Add_provider($$anchor, $$props) {
	$.push($$props, true);

	let agent = $.prop($$props, 'agent', 15),
		installer = $.prop($$props, 'installer', 15, 'jsrepo'),
		registry = $.prop($$props, 'registry', 15);

	useAddProvider({
		registryOptions: box.with(() => $$props.registryOptions),
		registry: box.with(() => registry(), (v) => registry(v)),
		agent: box.with(() => agent(), (v) => agent(v)),
		installer: box.with(() => installer(), (v) => installer(v))
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}