import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<nav class="card bg-surface-100-900 p-4"><div class="text-sm space-y-2"><div class="font-bold">On This Page</div> <ul class="space-y-2"><li><a class="anchor block">Overview</a></li> <!></ul></div></nav>`);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	/** The text value within the heading tag; stripped of HTML. */
	/** A generated slug value based on the text. */
	/** Depth indicates headings H1-H6. */
	/** The generated list of page headings, slugs, and depth. */
	const headings = [
		{
			text: 'Real World Example',
			slug: 'real-world-example',
			depth: 1
		},
		{ text: 'Semantic Markup', slug: 'semantic-markup', depth: 1 },
		{ text: 'Utilities', slug: 'utilities', depth: 1 },
		{ text: 'Grid', slug: 'grid', depth: 2 },
		{ text: 'Alignment', slug: 'alignment', depth: 2 },
		{
			text: 'Responsive Design',
			slug: 'responsive-design',
			depth: 2
		},
		{ text: 'In Conclusion', slug: 'in-conclusion', depth: 1 }
	];

	/** Provide a padding-left class based on the depth. */
	function setIndentationClass(depth) {
		return ({
			0: 'pl-0',
			1: 'pl-2',
			2: 'pl-4',
			3: 'pl-6',
			4: 'pl-8',
			5: 'pl-10'
		})[depth] ?? 'pl-0';
	}

	var nav = root_1();
	var div = $.child(nav);
	var ul = $.sibling($.child(div), 2);
	var li = $.child(ul);
	var a = $.child(li);

	$.set_attribute(a, 'href', `#_top`);
	$.reset(li);

	var node = $.sibling(li, 2);

	$.each(node, 17, () => headings, $.index, ($$anchor, heading) => {
		var li_1 = root();
		var a_1 = $.child(li_1);
		var text = $.only_child(a_1, true);

		$.reset(li_1);

		$.template_effect(
			($0) => {
				$.set_attribute(a_1, 'href', `#${$.get(heading).slug}`);
				$.set_class(a_1, 1, `anchor block ${$0 ?? ''}`);
				$.set_text(text, $.get(heading).text);
			},
			[() => setIndentationClass($.get(heading).depth)]
		);

		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}