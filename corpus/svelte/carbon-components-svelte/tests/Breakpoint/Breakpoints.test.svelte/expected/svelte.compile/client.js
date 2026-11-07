import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import breakpoints from "carbon-components-svelte/Breakpoint/breakpoints";

var root = $.from_html(`<div data-testid="sm"> </div> <div data-testid="md"> </div> <div data-testid="lg"> </div> <div data-testid="xlg"> </div> <div data-testid="max"> </div>`, 1);

export default function Breakpoints_test($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3, true);
	var div_4 = $.sibling(div_3, 2);
	var text_4 = $.only_child(div_4, true);

	$.template_effect(() => {
		$.set_text(text, breakpoints.sm);
		$.set_text(text_1, breakpoints.md);
		$.set_text(text_2, breakpoints.lg);
		$.set_text(text_3, breakpoints.xlg);
		$.set_text(text_4, breakpoints.max);
	});

	$.append($$anchor, fragment);
	$.pop();
}