import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getMapContext } from './context.svelte.js';

var root = $.from_html(`<div><!></div>`);

export default function Control($$anchor, $$props) {
	$.push($$props, true);

	let defaultStyling = $.prop($$props, 'defaultStyling', 3, true),
		position = $.prop($$props, 'position', 3, 'top-right'),
		classNames = $.prop($$props, 'class', 3, undefined);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map);

	let el = $.state(void 0);

	let control = {
		onAdd() {
			return $.get(el);
		},

		onRemove() {
			$.get(el)?.parentNode?.removeChild($.get(el));
		}
	};

	$.user_effect(() => {
		$.get(map)?.addControl(control, position());
	});

	onDestroy(() => {
		$.get(map)?.removeControl(control);
	});

	var div = root();
	let classes;
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(el, $$value), () => $.get(el));
	$.template_effect(() => classes = $.set_class(div, 1, $.clsx(classNames()), null, classes, { 'maplibregl-ctrl': defaultStyling() }));
	$.append($$anchor, div);
	$.pop();
}