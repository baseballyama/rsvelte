import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <div> </div> <div> </div> <div> </div> <div> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $userName1 = () => $.store_get(userName1, '$userName1', $$stores);
	const $userName2 = () => $.store_get(userName2, '$userName2', $$stores);
	const $userName3 = () => $.store_get(userName3, '$userName3', $$stores);
	const $userName4 = () => $.store_get(userName4, '$userName4', $$stores);
	const $userName5 = () => $.store_get(userName5, '$userName5', $$stores);
	const $userName6 = () => $.store_get(userName6, '$userName6', $$stores);
	const $userName7 = () => $.store_get(userName7, '$userName7', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let userName1 = writable('init1');
	let userName2 = writable('init2');
	let userName3 = writable('init3');
	let userName4 = writable('init4');
	let userName5 = writable('init5');
	let userName6 = writable('init6');
	let userName7 = writable('init7');

	let obj = {
		userName1: 'user1',
		userName2: 'user2',
		userName3: 'user3',
		$userName4: 'user4',
		userName5: 'user5',
		$userName6: 'user6',
		userName7: 'user7'
	};

	(
		$.store_set(userName1, obj.userName1),
		$.store_set(userName2, obj.$userName2)
	);

	($.store_set(userName3, obj.$userName3));
	($.store_set(userName4, obj.$userName4));

	(
		$.store_set(userName5, obj.$userName5),
		$.store_set(userName6, obj.$userName6),
		$.store_set(userName7, obj.$userName7)
	);

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3);
	var div_4 = $.sibling(div_3, 2);
	var text_4 = $.only_child(div_4);
	var div_5 = $.sibling(div_4, 2);
	var text_5 = $.only_child(div_5);
	var div_6 = $.sibling(div_5, 2);
	var text_6 = $.only_child(div_6);

	$.template_effect(() => {
		$.set_text(text, `$userName1: ${$userName1() ?? ''}`);
		$.set_text(text_1, `$userName2: ${$userName2() ?? ''}`);
		$.set_text(text_2, `$userName3: ${$userName3() ?? ''}`);
		$.set_text(text_3, `$userName4: ${$userName4() ?? ''}`);
		$.set_text(text_4, `$userName5: ${$userName5() ?? ''}`);
		$.set_text(text_5, `$userName6: ${$userName6() ?? ''}`);
		$.set_text(text_6, `$userName7: ${$userName7() ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}