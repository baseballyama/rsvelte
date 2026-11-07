import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import NavMenu from './NavMenu.svelte';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<p class="svelte-1uzwzmu"> </p> <!>`, 1);

export default function NavMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => Object.entries($$props.items), $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let title = () => $.get($$array)[0];
		let value = () => $.get($$array)[1];
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				const href = $.derived(() => `/svelte-canvas${value()}`);
				var a = root();
				let classes;
				var text = $.only_child(a, true);

				$.template_effect(
					($0) => {
						$.set_attribute(a, 'href', $.get(href));
						classes = $.set_class(a, 1, 'svelte-1uzwzmu', null, classes, { active: $0 });
						$.set_text(text, title());
					},
					[
						() => $page().url.pathname.replace(/\/$/, '') === $.get(href)
					]
				);

				$.append($$anchor, a);
			};

			var consequent_1 = ($$anchor) => {
				var fragment_2 = root_1();
				var p = $.first_child(fragment_2);
				var text_1 = $.only_child(p, true);
				var node_2 = $.sibling(p, 2);

				NavMenu(node_2, {
					get items() {
						return value();
					}
				});

				$.template_effect(() => $.set_text(text_1, title()));
				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if (typeof value() === 'string') $$render(consequent); else if (typeof value() === 'object') $$render(consequent_1, 1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}