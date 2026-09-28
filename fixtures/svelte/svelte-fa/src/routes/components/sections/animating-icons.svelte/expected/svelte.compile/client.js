import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fa from "$lib/fa.svelte";
import { faCircleNotch, faCog, faSpinner, faStroopwafel, faSync } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(`<!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!> <!> <!> <!></div> <!>`, 1);

export default function Animating_icons($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Animating Icons' });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Fa(node_1, {
		get icon() {
			return faSpinner;
		},
		size: '3x',
		spin: true
	});

	var node_2 = $.sibling(node_1, 2);

	Fa(node_2, {
		get icon() {
			return faCircleNotch;
		},
		size: '3x',
		spin: true
	});

	var node_3 = $.sibling(node_2, 2);

	Fa(node_3, {
		get icon() {
			return faSync;
		},
		size: '3x',
		spin: true
	});

	var node_4 = $.sibling(node_3, 2);

	Fa(node_4, {
		get icon() {
			return faCog;
		},
		size: '3x',
		spin: true
	});

	var node_5 = $.sibling(node_4, 2);

	Fa(node_5, {
		get icon() {
			return faSpinner;
		},
		size: '3x',
		pulse: true
	});

	var node_6 = $.sibling(node_5, 2);

	Fa(node_6, {
		get icon() {
			return faStroopwafel;
		},
		size: '3x',
		spin: true
	});

	$.reset(div);

	var node_7 = $.sibling(div, 2);

	DocsCode(node_7, {
		get code() {
			return codes.animatingIcons[0];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}