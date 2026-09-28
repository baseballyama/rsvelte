import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'collapsed']);
var root = $.from_html(`<label><input class="codeblock-collapsed sr-only" type="checkbox"/> <span class="sr-only">Collapse</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentcolor" viewBox="0 0 256 256"><path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path></svg></label>`);

export default function ButtonCollapse($$anchor, $$props) {
	$.push($$props, true);

	let collapsed = $.prop($$props, 'collapsed', 15),
		rest = $.rest_props($$props, rest_excludes);

	var label = root();

	$.attribute_effect(label, () => ({ ...rest }), void 0, void 0, void 0, 'svelte-5u15ai');

	var input = $.child(label);

	$.remove_input_defaults(input);

	var svg = $.sibling(input, 4);
	let classes;

	$.reset(label);

	$.template_effect(() => {
		$.set_attribute(input, 'id', $$props.id);
		classes = $.set_class(svg, 0, '', null, classes, { 'animate-bounce': collapsed() });
	});

	$.bind_checked(input, collapsed);
	$.append($$anchor, label);
	$.pop();
}