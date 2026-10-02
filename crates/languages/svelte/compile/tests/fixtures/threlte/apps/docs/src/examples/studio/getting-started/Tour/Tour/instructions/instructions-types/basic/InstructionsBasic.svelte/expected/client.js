import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="text-xl leading-snug font-bold text-neutral-800"></h2>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<div class="flex items-start gap-1.5 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1 text-sm leading-snug shadow-xs"><div class="relative flex h-[1.375em] w-[1.375em] shrink-0 grow-0 items-center justify-center"><svg class="absolute h-[85%] w-[85%] text-neutral-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"></path></svg></div> <!></div>`);
var root_3 = $.from_html(`<div class="leading-snug font-semibold">→ <!></div>`);
var root_4 = $.from_html(`<small>Click anywhere to continue.</small>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-3"><!> <!> <!> <!> <!></div>`);

export default function InstructionsBasic($$anchor, $$props) {
	let headline = $.prop($$props, 'headline', 3, ''),
		message = $.prop($$props, 'message', 3, ''),
		clickAnywhere = $.prop($$props, 'clickAnywhere', 3, false),
		centerText = $.prop($$props, 'centerText', 3, false),
		cta = $.prop($$props, 'cta', 3, ''),
		tip = $.prop($$props, 'tip', 3, '');

	var div = root_5();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var h2 = root();

			$.html(h2, headline, true);
			$.reset(h2);
			$.append($$anchor, h2);
		};

		$.if(node, ($$render) => {
			if (headline()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			let classes;

			$.html(div_1, message, true);
			$.reset(div_1);
			$.template_effect(() => classes = $.set_class(div_1, 1, 'leading-snug', null, classes, { 'text-center': centerText() }));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (message()) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var node_3 = $.sibling($.child(div_2), 2);

			$.html(node_3, tip);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if (tip()) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_3();
			var node_5 = $.sibling($.child(div_3));

			$.html(node_5, cta);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if (cta()) $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var small = root_4();
			let classes_1;

			$.template_effect(() => classes_1 = $.set_class(small, 1, 'block w-full text-neutral-600', null, classes_1, { 'text-center': centerText() }));
			$.append($$anchor, small);
		};

		$.if(node_6, ($$render) => {
			if (clickAnywhere()) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}