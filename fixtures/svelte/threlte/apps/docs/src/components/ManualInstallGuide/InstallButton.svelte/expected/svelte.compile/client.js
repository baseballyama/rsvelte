import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'active',
	'passivelyActive',
	'class',
	'children'
]);

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" class="h-[1.5em] w-auto fill-current group-hover:text-white" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" class="h-[1.5em] w-auto fill-current group-hover:text-white" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>`);
var root_2 = $.from_html(`<button><!> <code><!></code></button>`);

export default function InstallButton($$anchor, $$props) {
	let active = $.prop($$props, 'active', 3, false),
		passivelyActive = $.prop($$props, 'passivelyActive', 3, false),
		_class = $.prop($$props, 'class', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	var button = root_2();

	$.attribute_effect(button, () => ({
		...rest,
		class: [
			'group flex flex-row items-center justify-start gap-2 rounded-md border border-white/20 px-3 py-1 pr-4',
			active()
				? 'bg-green-500/70 text-white'
				: passivelyActive()
					? 'bg-green-500/20 text-white'
					: 'bg-blue-900 hover:bg-blue-700/30',
			_class()
		]
	}));

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if (active() || passivelyActive()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var code = $.sibling(node, 2);
	var node_1 = $.child(code);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(code);
	$.reset(button);

	$.template_effect(() => $.set_class(code, 1, $.clsx([
		'mx-0 bg-transparent px-0',
		active() || passivelyActive() ? 'text-white' : 'text-faded group-hover:text-white'
	])));

	$.append($$anchor, button);
}