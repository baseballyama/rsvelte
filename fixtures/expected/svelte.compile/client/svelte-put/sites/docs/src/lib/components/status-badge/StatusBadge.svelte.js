import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'status',
	'class',
	'children'
]);

var root = $.from_html(`<span><!></span>`);

export default function StatusBadge($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	const BADGE_CLASSES = {
		beta: 'hl-info',
		dev: 'hl-warning',
		new: 'hl-success',
		flux: 'hl-error',
		stable: 'bg-gray-700 text-white'
	};

	let badgeClass = $.derived(() => BADGE_CLASSES[$$props.status]);
	var span = root();

	$.attribute_effect(span, () => ({
		class: `rounded-lg px-1.5 py-px text-xs ${$.get(badgeClass) ?? ''} ${$$props.class ?? ''}`,
		...rest
	}));

	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.status));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(span);
	$.append($$anchor, span);
}