import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

var root = $.from_html(`<div>events</div> <div>memoized</div> <p>static</p> <span> </span> <button type="button">toggle</button>`, 1);

export default function Spread_mixed($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	let count = $.state(0);
	let active = $.state(false);
	function extra() {
		return { 'data-extra': $.get(count) };
	}
	function log() {
		console.log($.get(count));
	}
	var fragment = root();
	var div = $.first_child(fragment);
	var event_handler = () => $.update(count);
	$.attribute_effect(div, () => ({ ...rest, class: $$props.class, onclick: event_handler, 'data-count': $.get(count) }));
	var div_1 = $.sibling(div, 2);
	$.attribute_effect(div_1, ($0) => ({ ...$0, title: `n ${$.get(count) ?? ''}`, [$.CLASS]: { active: $.get(active) } }), [() => extra()]);
	var p = $.sibling(div_1, 2);
	$.attribute_effect(p, () => ({ class: 'note', ...rest, onmouseenter: log, hidden: true }));
	var span = $.sibling(p, 2);
	$.attribute_effect(span, () => ({ ...{ role: 'status' }, 'aria-live': 'polite' }));
	var text = $.only_child(span, true);
	var button = $.sibling(span, 2);
	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.set(active, !$.get(active)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
