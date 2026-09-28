import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Comp from './Comp.svelte';

var root = $.from_html(`<select><option>A</option><option>B</option><option>C</option></select>`);

export default function Main($$anchor, $$props) {
	$.push($$props, false);

	const $myStore = () => $.store_get(myStore, '$myStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const myStore = writable('');

	$.init();

	{
		const children = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var select = root();

			$.attribute_effect(select, () => ({ ...props() }));
			$.bind_select_value(select, $myStore, ($$value) => $.store_set(myStore, $$value));
			$.append($$anchor, select);
		};

		Comp($$anchor, { children, $$slots: { default: true } });
	}

	$.pop();
	$$cleanup();
}