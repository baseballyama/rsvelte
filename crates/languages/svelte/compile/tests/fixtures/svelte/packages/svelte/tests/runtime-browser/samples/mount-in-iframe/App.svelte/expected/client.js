import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mount } from 'svelte';
import Child from './Child.svelte';

var root = $.from_html(`<iframe title="container"></iframe>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let iframe;

	$.user_effect(() => {
		mount(Child, {
			target: iframe.contentWindow.document.body,
			props: { count: $$props.count }
		});
	});

	var iframe_1 = root();

	$.bind_this(iframe_1, ($$value) => iframe = $$value, () => iframe);
	$.append($$anchor, iframe_1);
	$.pop();
}