import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "components/Checkbox";
import Code from "docs/Code.svelte";
import { right, elevation, persistent, showNav } from "stores.js";
import drawers from "examples/navigation-drawers.txt";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Navigation_drawers($$anchor) {
	const $showNav = () => $.store_get(showNav, '$showNav', $$stores);
	const $elevation = () => $.store_get(elevation, '$elevation', $$stores);
	const $right = () => $.store_get(right, '$right', $$stores);
	const $persistent = () => $.store_get(persistent, '$persistent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		label: 'Show drawer',
		get checked() {
			$.mark_store_binding();

			return $showNav();
		},

		set checked($$value) {
			$.store_set(showNav, $$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		label: 'With elevation',
		get checked() {
			$.mark_store_binding();

			return $elevation();
		},

		set checked($$value) {
			$.store_set(elevation, $$value);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		label: 'Placed on the right',
		get checked() {
			$.mark_store_binding();

			return $right();
		},

		set checked($$value) {
			$.store_set(right, $$value);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Checkbox(node_3, {
		label: 'Persistent',
		get checked() {
			$.mark_store_binding();

			return $persistent();
		},

		set checked($$value) {
			$.store_set(persistent, $$value);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Code(node_4, {
		get code() {
			return drawers;
		}
	});

	$.append($$anchor, fragment);
	$$cleanup();
}