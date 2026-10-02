import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Input($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = someStore();

	$store();
	$store().prop;
	$store()['prop'];
	$store().prop.anotherProp;
	$store()['prop'].anotherProp;
	$store().prop['anotherProp'];
	$store()['prop']['anotherProp'];
	$store()?.prop.anotherProp;
	$store()?.prop?.anotherProp;

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4, true);
	var p_5 = $.sibling(p_4, 2);
	var text_5 = $.only_child(p_5, true);
	var p_6 = $.sibling(p_5, 2);
	var text_6 = $.only_child(p_6, true);
	var p_7 = $.sibling(p_6, 2);
	var text_7 = $.only_child(p_7, true);
	var p_8 = $.sibling(p_7, 2);
	var text_8 = $.only_child(p_8, true);

	$.template_effect(() => {
		$.set_text(text, $store());
		$.set_text(text_1, $store().prop);
		$.set_text(text_2, $store()['prop']);
		$.set_text(text_3, $store().prop.anotherProp);
		$.set_text(text_4, $store()['prop'].anotherProp);
		$.set_text(text_5, $store().prop['anotherProp']);
		$.set_text(text_6, $store()['prop']['anotherProp']);
		$.set_text(text_7, $store()?.prop.anotherProp);
		$.set_text(text_8, $store()?.prop?.anotherProp);
	});

	$.append($$anchor, fragment);
	$$cleanup();
}