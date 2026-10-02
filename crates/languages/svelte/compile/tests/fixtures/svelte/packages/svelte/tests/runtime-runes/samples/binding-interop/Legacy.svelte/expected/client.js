import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';

var root = $.from_html(` <!> <!> <!> <!>`, 1);

export default function Legacy($$anchor) {
	let object1 = $.mutable_source({ value: 'foo' });
	let object2 = $.mutable_source({ value: 'foo' });
	let primitive1 = $.mutable_source('foo');
	let primitive2 = $.mutable_source('foo');

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	Component1(node, {
		get object() {
			return $.get(object1);
		},

		set object($$value) {
			$.set(object1, $$value);
		},
		$$legacy: true
	});

	var text_1 = $.sibling(node);
	var node_1 = $.sibling(text_1);

	Component2(node_1, {
		get object() {
			return $.get(object2);
		},

		set object($$value) {
			$.set(object2, $$value);
		},
		$$legacy: true
	});

	var text_2 = $.sibling(node_1);
	var node_2 = $.sibling(text_2);

	Component1(node_2, {
		get primitive() {
			return $.get(primitive1);
		},

		set primitive($$value) {
			$.set(primitive1, $$value);
		},
		$$legacy: true
	});

	var text_3 = $.sibling(node_2);
	var node_3 = $.sibling(text_3);

	Component2(node_3, {
		get primitive() {
			return $.get(primitive2);
		},

		set primitive($$value) {
			$.set(primitive2, $$value);
		},
		$$legacy: true
	});

	$.template_effect(() => {
		$.set_text(text, `${($.get(object1), $.untrack(() => $.get(object1).value)) ?? ''} `);
		$.set_text(text_1, ` ${($.get(object2), $.untrack(() => $.get(object2).value)) ?? ''} `);
		$.set_text(text_2, ` ${$.get(primitive1) ?? ''} `);
		$.set_text(text_3, ` ${$.get(primitive2) ?? ''} `);
	});

	$.append($$anchor, fragment);
}