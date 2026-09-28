import 'svelte/internal/disclose-version';
import { tick } from 'svelte';
import * as $ from 'svelte/internal/client';

function portal(el, target = 'body') {
	let targetEl;

	async function update(newTarget) {
		target = newTarget;

		if (typeof target === 'string') {
			targetEl = document.querySelector(target);

			if (targetEl === null) {
				await tick();
				targetEl = document.querySelector(target);
			}

			if (targetEl === null) {
				throw new Error(`No element found matching css selector: '${target}'`);
			}
		} else {
			targetEl = target;
		}

		targetEl.append(el);
	}

	update(target);

	return {
		update,
		destroy() {
			el.remove();
		}
	};
}

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'target', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	let target = $.prop($$props, 'target', 3, 'body'),
		rest = $.rest_props($$props, rest_excludes);

	var /**
	 * DOM Element or CSS Selector
	 */
	div = root();

	$.attribute_effect(div, () => ({ style: 'display: contents;', ...rest }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => portal?.($$node, $$action_arg), target);
	$.append($$anchor, div);
	$.pop();
}