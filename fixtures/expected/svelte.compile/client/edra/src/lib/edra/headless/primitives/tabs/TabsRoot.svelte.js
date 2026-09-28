import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setTabs } from './context.ts';

var root = $.from_html(`<div><!></div>`);

export default function TabsRoot($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ''),
		className = $.prop($$props, 'class', 3, '');

	const context = {
		get value() {
			return value();
		},

		setValue(val) {
			value(val);
			$$props.onValueChange?.(val);
		}
	};

	setTabs(context);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `tabs-root ${className() ?? ''}`, 'svelte-qy6xco'));
	$.append($$anchor, div);
	$.pop();
}