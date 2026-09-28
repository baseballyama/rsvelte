import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	let tag = $.prop($$props, 'tag', 3, "div"),
		active = $.prop($$props, 'active', 3, false);

	function cn(classname) {
		return classname;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, tag, false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, tag, false, ($$element_1, $$anchor) => {
		$.set_class($$element_1, 0, 'red svelte-25v2w4');
	});

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, tag, false, ($$element_2, $$anchor) => {
		let classes;

		$.template_effect(() => classes = $.set_class($$element_2, 0, '', null, classes, { active: active() }));
	});

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, tag, false, ($$element_3, $$anchor) => {
		let classes_1;

		$.template_effect(() => classes_1 = $.set_class($$element_3, 0, 'red svelte-25v2w4', null, classes_1, { active: active() }));
	});

	var node_4 = $.sibling(node_3, 2);

	$.element(node_4, tag, false, ($$element_4, $$anchor) => {
		$.attribute_effect($$element_4, ($0) => ({ class: $0 }), [() => cn("blue")], void 0, void 0, 'svelte-25v2w4');
	});

	var node_5 = $.sibling(node_4, 2);

	$.element(node_5, tag, false, ($$element_5, $$anchor) => {
		$.attribute_effect($$element_5, ($0) => ({ class: $0, [$.CLASS]: { active: active() } }), [() => cn("blue")], void 0, void 0, 'svelte-25v2w4');
	});

	$.append($$anchor, fragment);
}