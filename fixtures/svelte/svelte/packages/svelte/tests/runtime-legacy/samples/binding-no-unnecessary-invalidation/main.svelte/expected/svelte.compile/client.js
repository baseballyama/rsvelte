import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";
import Tab from "./Tab.svelte";

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $tab = () => $.store_get(tab, '$tab', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let i = 0;
	const { set, subscribe } = writable({ id: 1, name: "tab1" });

	const tab = {
		set(value) {
			i++;
			set(value);
		},
		subscribe
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Tab(node, {
		get tab() {
			$.mark_store_binding();

			return $tab();
		},

		set tab($$value) {
			$.store_set(tab, $$value);
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, i));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}