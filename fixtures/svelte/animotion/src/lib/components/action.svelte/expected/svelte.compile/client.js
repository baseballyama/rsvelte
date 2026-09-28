import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Action from '$lib/components/action.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'order', 'actions']);
var root = $.from_html(`<div class="fragment hidden"></div>`);

export default function Action_1($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	let el = $.state(void 0);
	const noop = () => {};
	const action = () => $$props?.do?.() ?? noop();
	const undo = () => $$props?.undo?.() ?? noop();

	$.user_effect(() => {
		$.get(el)?.addEventListener('current', action);
		$.get(el)?.addEventListener('out', undo);

		return () => {
			$.get(el)?.removeEventListener('current', action);
			$.get(el)?.removeEventListener('out', undo);
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $$props.actions, $.index, ($$anchor, action, i, $$array) => {
				const previousAction = $.derived(() => i === 0 ? undo : $$props.actions[i - 1]);

				Action($$anchor, {
					get do() {
						return $.get(action);
					},

					get undo() {
						return $.get(previousAction);
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.bind_this(div, ($$value) => $.set(el, $$value), () => $.get(el));
			$.template_effect(() => $.set_attribute(div, 'data-fragment-index', $$props.order));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.actions) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}