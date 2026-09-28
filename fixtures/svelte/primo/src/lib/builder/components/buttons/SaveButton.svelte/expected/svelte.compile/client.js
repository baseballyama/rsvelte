import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import UI from '../../ui';

var root = $.from_html(`<button><!></button>`);

export default function SaveButton($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {string} [variants]
	 * @property {string} [type]
	 * @property {boolean} [disabled]
	 * @property {boolean} [loading]
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let variants = $.prop($$props, 'variants', 3, ''),
		type = $.prop($$props, 'type', 3, 'button'),
		disabled = $.prop($$props, 'disabled', 3, false),
		loading = $.prop($$props, 'loading', 3, false);

	var button = root();
	let classes;
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => UI.Spinner, ($$anchor, UI_Spinner) => {
				UI_Spinner($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (loading()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		classes = $.set_class(button, 1, $.clsx(variants()), 'svelte-o90jj1', classes, { disabled: disabled() || loading() });
		button.disabled = disabled() || loading();
		$.set_attribute(button, 'type', type());
	});

	$.delegated('click', button, (e) => dispatch('click', e));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);