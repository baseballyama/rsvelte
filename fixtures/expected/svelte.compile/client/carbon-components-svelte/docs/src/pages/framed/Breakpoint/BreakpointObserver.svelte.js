import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { breakpointObserver, breakpoints } from "carbon-components-svelte";

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function BreakpointObserver($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const $smaller = () => $.store_get(smaller, '$smaller', $$stores);
	const $larger = () => $.store_get(larger, '$larger', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const size = breakpointObserver();
	const smaller = size.smallerThan("md");
	const larger = size.largerThan("md");
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3);

	$.template_effect(() => {
		$.set_text(text, `Current breakpoint size: ${$size() ?? ''}`);
		$.set_text(text_1, `Current breakpoint value: ${breakpoints[$size()] ?? ''}px`);
		$.set_text(text_2, `Smaller than medium: ${$smaller() ?? ''}`);
		$.set_text(text_3, `Larger than medium: ${$larger() ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}