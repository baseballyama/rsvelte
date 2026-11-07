import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fa from "$lib/fa.svelte";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(`<!> <div class="shadow-sm p-3 mb-3 rounded"><!> Flag</div> <!> <div class="shadow-sm p-3 mb-3 rounded">Icons import from <a href="https://www.npmjs.com/search?q=%40fortawesome%20svg%20icons" target="_blank">FontAwesome packages</a>, for example: @fortawesome/free-solid-svg-icons. <br/> Icons gallery: <a href="https://fontawesome.com/icons" target="_blank">FontAwesome icons</a></div> <div class="shadow-sm p-3 mb-3 rounded"><div style="font-size: 3em; color: tomato"><!></div></div> <!>`, 1);

export default function Basic_use($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Basic Use' });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Fa(node_1, {
		get icon() {
			return faFlag;
		}
	});

	$.next();
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	DocsCode(node_2, {
		get code() {
			return codes.basicUse[0];
		}
	});

	var div_1 = $.sibling(node_2, 4);
	var div_2 = $.child(div_1);
	var node_3 = $.child(div_2);

	Fa(node_3, {
		get icon() {
			return faFlag;
		}
	});

	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	DocsCode(node_4, {
		get code() {
			return codes.basicUse[1];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}