import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { link, location } from "svelte-spa-router";

var root = $.from_html(`<a href="/"> </a>`);

export default function Link($$anchor, $$props) {
	$.push($$props, true);

	const $location = () => $.store_get(location, '$location', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const fullPath = $.derived(() => $$props.data[0].replace(":skin", $$props.skin));
	const isActive = $.derived(() => $location().startsWith($.get(fullPath)));
	var a = root();
	let classes;
	var text = $.only_child(a, true);

	$.action(a, ($$node, $$action_arg) => link?.($$node, $$action_arg), () => $.get(fullPath));

	$.template_effect(() => {
		classes = $.set_class(a, 1, 'demo svelte-3ib7bl', null, classes, { active: $.get(isActive) });
		$.set_text(text, $$props.data[1]);
	});

	$.delegated('click', a, () => $.get(isActive) && $$props.onclick?.());
	$.append($$anchor, a);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);