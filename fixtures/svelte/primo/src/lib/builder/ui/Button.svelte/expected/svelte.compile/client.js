import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '$lib/builder/ui';
import Icon from '@iconify/svelte';

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<button><!> <!> <!> <!></button>`);

export default function Button($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [label]?
	 * @property {() => void} [onclick]?
	 * @property {string} [icon]?
	 * @property {'button' | 'submit'} [type]?
	 * @property {string} [variants]?
	 * @property {boolean} [disabled]?
	 * @property {boolean} [loading]?
	 * @property {boolean} [arrow]?
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let variants = $.prop($$props, 'variants', 3, '' /** @type {"button" | "submit"} */),
		type = $.prop($$props, 'type', 3, 'button'),
		disabled = $.prop($$props, 'disabled', 3, false),
		loading = $.prop($$props, 'loading', 3, false),
		arrow = $.prop($$props, 'arrow', 3, false);

	var button = root_2();
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

		$.if(node, ($$render) => {
			if (loading()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root();
			let classes;
			var node_3 = $.child(span);

			Icon(node_3, {
				get icon() {
					return $$props.icon;
				}
			});

			$.reset(span);
			$.template_effect(() => classes = $.set_class(span, 1, '', null, classes, { hidden: loading() }));
			$.append($$anchor, span);
		};

		$.if(node_2, ($$render) => {
			if ($$props.icon) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_5 = $.first_child(fragment_1);

			$.snippet(node_5, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		var consequent_3 = ($$anchor) => {
			var span_1 = root_1();
			let classes_1;
			var text = $.only_child(span_1, true);

			$.template_effect(() => {
				classes_1 = $.set_class(span_1, 1, '', null, classes_1, { hidden: loading() });
				$.set_text(text, $$props.label);
			});

			$.append($$anchor, span_1);
		};

		$.if(node_4, ($$render) => {
			if ($$props.children) $$render(consequent_2); else if ($$props.label) $$render(consequent_3, 1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			Icon($$anchor, { icon: 'ooui:arrow-next-ltr' });
		};

		$.if(node_6, ($$render) => {
			if (arrow()) $$render(consequent_4);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		$.set_class(button, 1, `Button ${variants() ?? ''}`, 'svelte-d37d3q');
		$.set_attribute(button, 'type', type());
		button.disabled = disabled() || loading();
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);