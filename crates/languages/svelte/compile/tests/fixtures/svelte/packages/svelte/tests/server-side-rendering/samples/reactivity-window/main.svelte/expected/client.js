import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	devicePixelRatio,
	innerHeight,
	innerWidth,
	online,
	outerHeight,
	outerWidth,
	screenLeft,
	screenTop,
	scrollX,
	scrollY
} from "svelte/reactivity/window";

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4);
	var p_5 = $.sibling(p_4, 2);
	var text_5 = $.only_child(p_5);
	var p_6 = $.sibling(p_5, 2);
	var text_6 = $.only_child(p_6);
	var p_7 = $.sibling(p_6, 2);
	var text_7 = $.only_child(p_7);
	var p_8 = $.sibling(p_7, 2);
	var text_8 = $.only_child(p_8);
	var p_9 = $.sibling(p_8, 2);
	var text_9 = $.only_child(p_9);

	$.template_effect(() => {
		$.set_text(text, `devicePixelRatio: ${devicePixelRatio.current ?? ''}`);
		$.set_text(text_1, `innerHeight: ${innerHeight.current ?? ''}`);
		$.set_text(text_2, `innerWidth: ${innerWidth.current ?? ''}`);
		$.set_text(text_3, `online: ${online.current ?? ''}`);
		$.set_text(text_4, `outerHeight: ${outerHeight.current ?? ''}`);
		$.set_text(text_5, `outerWidth: ${outerWidth.current ?? ''}`);
		$.set_text(text_6, `screenLeft: ${screenLeft.current ?? ''}`);
		$.set_text(text_7, `screenTop: ${screenTop.current ?? ''}`);
		$.set_text(text_8, `scrollX: ${scrollX.current ?? ''}`);
		$.set_text(text_9, `scrollY: ${scrollY.current ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}