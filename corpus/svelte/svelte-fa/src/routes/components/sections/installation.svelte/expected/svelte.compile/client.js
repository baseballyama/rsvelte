import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(
	`<!> <!> <div class="shadow-sm p-3 mb-3 rounded">Install FontAwesome icons via <a href="https://www.npmjs.com/search?q=%40fortawesome%20svg%20icons" target="_blank">official packages</a>, for example:</div> <!> <div class="shadow-sm p-3 mb-3 rounded"><strong>Notice for <a href="https://sapper.svelte.dev/" target="_blank">Sapper</a> user:</strong> You
  may need to install the component as a devDependency:</div> <!> <div class="shadow-sm p-3 mb-3 rounded"><strong>Notice for <a href="https://kit.svelte.dev/" target="_blank">SvelteKit</a>/<a href="https://www.npmjs.com/package/vite" target="_blank">Vite</a> user:</strong> You may need to import the component explicitly as below:</div> <!> <div class="shadow-sm p-3 mb-3 rounded">When using typescript with SvelteKit/Vite, you may also needed to add type definitions that
  redirect to the non-index.es export:</div> <!>`,
	1
);

export default function Installation($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Installation' });

	var node_1 = $.sibling(node, 2);

	DocsCode(node_1, {
		get code() {
			return codes.installation[0];
		}
	});

	var node_2 = $.sibling(node_1, 4);

	DocsCode(node_2, {
		get code() {
			return codes.installation[1];
		}
	});

	var node_3 = $.sibling(node_2, 4);

	DocsCode(node_3, {
		get code() {
			return codes.installation[2];
		}
	});

	var node_4 = $.sibling(node_3, 4);

	DocsCode(node_4, {
		get code() {
			return codes.installation[3];
		},
		lang: 'js'
	});

	var node_5 = $.sibling(node_4, 4);

	DocsCode(node_5, {
		get code() {
			return codes.installation[4];
		},
		lang: 'js'
	});

	$.append($$anchor, fragment);
	$.pop();
}