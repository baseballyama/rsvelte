import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li> </li> <li> </li>`, 1);
var root_2 = $.from_html(`<ul></ul> <ul></ul> <ul></ul> <!> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	var fragment = root_2();
	var ul = $.first_child(fragment);

	$.each(ul, 21, () => $$props.items, $.index, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(item).name));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var ul_1 = $.sibling(ul, 2);

	$.each(ul_1, 20, () => $$props.items, (item) => item, ($$anchor, item) => {
		var li_1 = root();
		var text_1 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_1, item.name));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);

	var ul_2 = $.sibling(ul_1, 2);

	$.each(ul_2, 21, () => $$props.items, (item) => item.name, ($$anchor, item) => {
		var li_2 = root();
		var text_2 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_2, $.get(item).name));
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);

	var node = $.sibling(ul_2, 2);

	$.each(node, 17, () => $$props.items, $.index, ($$anchor, item) => {
		var fragment_1 = root_1();
		var li_3 = $.first_child(fragment_1);
		var text_3 = $.only_child(li_3, true);
		var li_4 = $.sibling(li_3, 2);
		var text_4 = $.only_child(li_4, true);

		$.template_effect(() => {
			$.set_text(text_3, $.get(item).name);
			$.set_text(text_4, $.get(item).name);
		});

		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => $$props.items, (item) => item, ($$anchor, item) => {
		var fragment_2 = root_1();
		var li_5 = $.first_child(fragment_2);
		var text_5 = $.only_child(li_5, true);
		var li_6 = $.sibling(li_5, 2);
		var text_6 = $.only_child(li_6, true);

		$.template_effect(() => {
			$.set_text(text_5, item.name);
			$.set_text(text_6, item.name);
		});

		$.append($$anchor, fragment_2);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => $$props.items, (item) => item.name, ($$anchor, item) => {
		var fragment_3 = root_1();
		var li_7 = $.first_child(fragment_3);
		var text_7 = $.only_child(li_7, true);
		var li_8 = $.sibling(li_7, 2);
		var text_8 = $.only_child(li_8, true);

		$.template_effect(() => {
			$.set_text(text_7, $.get(item).name);
			$.set_text(text_8, $.get(item).name);
		});

		$.append($$anchor, fragment_3);
	});

	$.append($$anchor, fragment);
}