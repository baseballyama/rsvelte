import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><div><!></div> <!></div>`);

export default function Integration_cardv4($$anchor, $$props) {
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();

			$.template_effect(() => $.set_class(div_2, 1, $.clsx([
				"absolute z-10 h-px bg-linear-to-r to-muted-foreground/25",
				$$props.position === "left-top" && "top-1/2 left-full w-32.5 origin-left rotate-25",
				$$props.position === "left-middle" && "top-1/2 left-full w-30 origin-left",
				$$props.position === "left-bottom" && "top-1/2 left-full w-32.5 origin-left rotate-[-25deg]",
				$$props.position === "right-top" && "top-1/2 right-full w-32.5 origin-right rotate-[-25deg] bg-linear-to-l",
				$$props.position === "right-middle" && "top-1/2 right-full w-30 origin-right bg-linear-to-l",
				$$props.position === "right-bottom" && "top-1/2 right-full w-32.5 origin-right rotate-25 bg-linear-to-l"
			])));

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.position && !$$props.isCenter) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx([
			"relative flex size-12 rounded-xl border bg-background dark:bg-transparent",
			$$props.class
		]));

		$.set_class(div_1, 1, $.clsx([
			"relative z-20 m-auto size-fit *:size-6",
			$$props.isCenter && "*:size-8"
		]));
	});

	$.append($$anchor, div);
}