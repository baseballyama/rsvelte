import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'align',
	'class',
	'for',
	'children'
]);

var root = $.from_html(`<label><span class="sr-only">Menu</span> <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="currentcolor"><path d="M21,7H3C2.4,7,2,6.6,2,6s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,7,21,7z"></path><path d="M17,11H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,11,17,11z"></path><path d="M21,15H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,15,21,15z"></path><path d="M17,19H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,19,17,19z"></path></svg> <!></label>`);

export default function MenuLabel($$anchor, $$props) {
	let align = $.prop($$props, 'align', 3, 'left'),
		rest = $.rest_props($$props, rest_excludes);

	const commonPathClasses = `transition-transform origin-left`;
	var label = root();

	$.attribute_effect(label, () => ({
		class: `hover:text-link group flex cursor-pointer items-center gap-2 text-xs ${$$props.class ?? ''}`,
		for: $$props.for,
		...rest,
		[$.CLASS]: { 'flex-row-reverse': align() === 'right' }
	}));

	var svg = $.sibling($.child(label), 2);
	let classes;
	var path = $.child(svg);

	$.set_class(path, 0, 'transition-transform origin-left group-hover:scale-x-75');

	var path_1 = $.sibling(path);

	$.set_class(path_1, 0, 'transition-transform origin-left group-hover:scale-x-125');

	var path_2 = $.sibling(path_1);

	$.set_class(path_2, 0, 'transition-transform origin-left group-hover:scale-x-75');

	var path_3 = $.sibling(path_2);

	$.set_class(path_3, 0, 'transition-transform origin-left group-hover:scale-x-125');
	$.reset(svg);

	var node = $.sibling(svg, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(label);
	$.template_effect(() => classes = $.set_class(svg, 0, 'inline h-6 w-6', null, classes, { '-scale-x-100': align() === 'right' }));
	$.append($$anchor, label);
}