import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<div><!></div>`);

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	let target = $.prop($$props, 'target', 3, 'body');

	const portal = (node, targetSelector) => {
		async function update(targetSelector) {
			let targetElement = document.querySelector(targetSelector);

			if (targetElement === null) {
				await tick();
				targetElement = document.querySelector(targetSelector);
			}

			if (targetElement === null) {
				throw new Error('No element found matching selector');
			}

			targetElement.appendChild(node);
		}

		function destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		update(targetSelector);

		return { update, destroy };
	};

	var div = root();
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => portal?.($$node, $$action_arg), target);
	$.append($$anchor, div);
	$.pop();
}