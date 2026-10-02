import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createAttachmentKey } from 'svelte/attachments';
import Child from './Child.svelte';

var root = $.from_html(`<button>update</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let stuff = $.state($.proxy({
		[createAttachmentKey()]: (node) => {
			console.log(`one ${node.nodeName}`);

			return () => {
				console.log('cleanup one');
			};
		}
	}));

	function update() {
		$.set(
			stuff,
			{
				[createAttachmentKey()]: (node) => {
					console.log(`two ${node.nodeName}`);

					return () => {
						console.log('cleanup two');
					};
				}
			},
			true
		);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node_1 = $.sibling(button, 2);

	Child(node_1, $.spread_props(() => $.get(stuff)));
	$.delegated('click', button, update);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);