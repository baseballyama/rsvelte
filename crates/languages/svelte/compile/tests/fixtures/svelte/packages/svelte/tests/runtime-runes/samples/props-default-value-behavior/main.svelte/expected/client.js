import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./inner.svelte";

var root = $.from_html(`<p>props undefined:</p> <!> <p>props defined:</p> <!> <p>bindings undefined:</p> <!> <p>bindings defined:</p> <!> <p> </p> <button>set everything to 10</button> <button>set everything to undefined</button>`, 1);

export default function Main($$anchor) {
	let readonly_undefined = $.state(void 0);
	let readonlyWithDefault_undefined = $.state(void 0);
	let binding_undefined = $.state(void 0);
	let readonly_defined = $.state(0);
	let readonlyWithDefault_defined = $.state(0);
	let binding_defined = $.state(0);
	let bind_readonly_undefined = $.state(void 0);
	let bind_binding_undefined = $.state(void 0);
	let bind_readonly_defined = $.state(0);
	let bind_binding_defined = $.state(0);
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Inner(node, {
		get readonly() {
			return $.get(readonly_undefined);
		},

		get readonlyWithDefault() {
			return $.get(readonlyWithDefault_undefined);
		},

		get binding() {
			return $.get(binding_undefined);
		}
	});

	var node_1 = $.sibling(node, 4);

	Inner(node_1, {
		get readonly() {
			return $.get(readonly_defined);
		},

		get readonlyWithDefault() {
			return $.get(readonlyWithDefault_defined);
		},

		get binding() {
			return $.get(binding_defined);
		}
	});

	var node_2 = $.sibling(node_1, 4);

	Inner(node_2, {
		get readonlyWithDefault() {
			return $.get(readonlyWithDefault_undefined);
		},

		get readonly() {
			return $.get(bind_readonly_undefined);
		},

		set readonly($$value) {
			$.set(bind_readonly_undefined, $$value, true);
		},

		get binding() {
			return $.get(bind_binding_undefined);
		},

		set binding($$value) {
			$.set(bind_binding_undefined, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 4);

	Inner(node_3, {
		get readonlyWithDefault() {
			return $.get(readonlyWithDefault_defined);
		},

		get readonly() {
			return $.get(bind_readonly_defined);
		},

		set readonly($$value) {
			$.set(bind_readonly_defined, $$value, true);
		},

		get binding() {
			return $.get(bind_binding_defined);
		},

		set binding($$value) {
			$.set(bind_binding_defined, $$value, true);
		}
	});

	var p = $.sibling(node_3, 2);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, `Main:
	readonly_undefined: ${$.get(readonly_undefined) ?? ''}
	readonlyWithDefault_undefined: ${$.get(readonlyWithDefault_undefined) ?? ''}
	binding_undefined: ${$.get(binding_undefined) ?? ''}
	readonly_defined: ${$.get(readonly_defined) ?? ''}
	readonlyWithDefault_defined: ${$.get(readonlyWithDefault_defined) ?? ''}
	binding_defined: ${$.get(binding_defined) ?? ''}
	bind_readonly_undefined: ${$.get(bind_readonly_undefined) ?? ''}
	bind_binding_undefined: ${$.get(bind_binding_undefined) ?? ''}
	bind_readonly_defined: ${$.get(bind_readonly_defined) ?? ''}
	bind_binding_defined: ${$.get(bind_binding_defined) ?? ''}`));

	$.event('click', button, () => {
		$.set(readonly_undefined, 10);
		$.set(readonlyWithDefault_undefined, 10);
		$.set(binding_undefined, 10);
		$.set(readonly_defined, 10);
		$.set(readonlyWithDefault_defined, 10);
		$.set(binding_defined, 10);
		$.set(bind_readonly_undefined, 10);
		$.set(bind_binding_undefined, 10);
		$.set(bind_readonly_defined, 10);
		$.set(bind_binding_defined, 10);
	});

	$.event('click', button_1, () => {
		$.set(readonly_undefined, undefined);
		$.set(readonlyWithDefault_undefined, undefined);
		$.set(binding_undefined, undefined);
		$.set(readonly_defined, undefined);
		$.set(readonlyWithDefault_defined, undefined);
		$.set(binding_defined, undefined);
		$.set(bind_readonly_undefined, undefined);
		$.set(bind_binding_undefined, undefined);
		$.set(bind_readonly_defined, undefined);
		$.set(bind_binding_defined, undefined);
	});

	$.append($$anchor, fragment);
}