import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'component', 'extension']);
var root = $.from_html(`<div data-mark-view-wrapper=""><!></div>`);

export default function MarkViewFrame($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	let className = $.derived(() => `svelte-renderer mark-${$$props.extension?.name || 'unknown'}`);
	var div = root();
	var node = $.child(div);

	$.component(node, () => $$props.component, ($$anchor, Component_1) => {
		Component_1($$anchor, $.spread_props(
			{
				get extension() {
					return $$props.extension;
				}
			},
			() => props
		));
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, $.clsx($.get(className))));
	$.append($$anchor, div);
	$.pop();
}