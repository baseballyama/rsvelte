import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const alerts = {
	note: { title: 'Note', classes: 'preset-tonal border-surface-950-50' },
	tip: {
		title: 'Tip',
		classes: 'preset-tonal-primary border-primary-500'
	},
	important: {
		title: 'Important',
		classes: 'preset-tonal-success border-success-500'
	},
	warning: {
		title: 'Warning',
		classes: 'preset-tonal-warning border-warning-500'
	},
	caution: {
		title: 'Caution',
		classes: 'preset-tonal-error border-error-500'
	}
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'as']);
var root = $.from_html(`<div><p class="font-bold uppercase"> </p> <p class="text-sm"><!></p></div>`);
var root_1 = $.from_html(`<blockquote><!></blockquote>`);

export default function Blockquote($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	const config = $.derived(() => $$props.as ? alerts[$$props.as] : null);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({
				class: `border-l-4 py-3 px-4 space-y-1 ${$.get(config).classes ?? ''}`,
				...rest
			}));

			var p = $.child(div);
			var text = $.only_child(p, true);
			var p_1 = $.sibling(p, 2);
			var node_1 = $.child(p_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(p_1);
			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(config).title));
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var blockquote = root_1();

			$.attribute_effect(blockquote, () => ({ class: 'blockquote', ...rest }));

			var node_2 = $.child(blockquote);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(blockquote);
			$.append($$anchor, blockquote);
		};

		$.if(node, ($$render) => {
			if ($.get(config)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}