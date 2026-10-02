import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { SUB_NAV } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<a><!> <div><div class="label svelte-2zju3r"> </div> <div class="title svelte-2zju3r"> </div></div></a>`);
var root_1 = $.from_html(`<nav class="ref-nav card svelte-2zju3r"><div class="nav-buttons svelte-2zju3r"></div> <div class="progress svelte-2zju3r"> <div class="progress-bar svelte-2zju3r"><div class="progress-fill svelte-2zju3r"></div></div></div></nav>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const pages = SUB_NAV['/reference']?.flatMap((s) => 'items' in s ? s.items : [s]) ?? [];
	const idx = $.derived(() => pages.findIndex((p) => p.href === ($page().url?.pathname ?? '/')));
	const isRef = $.derived(() => $.get(idx) > -1);
	const prev = $.derived(() => pages[$.get(idx) - 1]);
	const next = $.derived(() => pages[$.get(idx) + 1]);
	const progress = $.derived(() => $.get(isRef) ? ($.get(idx) + 1) / pages.length * 100 : 0);

	const nav = $.derived(() => [
		{ item: $.get(prev), side: 'Previous', icon: 'previous' },
		{ item: $.get(next), side: 'Next', icon: 'next' }
	]);

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var nav_1 = root_1();
			var div = $.child(nav_1);

			$.each(div, 21, () => $.get(nav), $.index, ($$anchor, $$item) => {
				let item = () => $.get($$item).item;
				let side = () => $.get($$item).side;
				let icon = () => $.get($$item).icon;
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var a = root();
						let classes;
						var node_3 = $.child(a);

						Icon(node_3, {
							get name() {
								return icon();
							}
						});

						var div_1 = $.sibling(node_3, 2);
						var div_2 = $.child(div_1);
						var text = $.only_child(div_2, true);
						var div_3 = $.sibling(div_2, 2);
						var text_1 = $.only_child(div_3, true);

						$.reset(div_1);
						$.reset(a);

						$.template_effect(() => {
							$.set_attribute(a, 'href', item().href);
							classes = $.set_class(a, 1, 'nav-btn svelte-2zju3r', null, classes, { next: side() === 'Next' });
							$.set_text(text, side());
							$.set_text(text_1, item().label);
						});

						$.append($$anchor, a);
					};

					$.if(node_2, ($$render) => {
						if (item()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.reset(div);

			var div_4 = $.sibling(div, 2);
			var text_2 = $.child(div_4);
			var div_5 = $.sibling(text_2);
			var div_6 = $.child(div_5);
			let styles;

			$.reset(div_5);
			$.reset(div_4);
			$.reset(nav_1);

			$.template_effect(() => {
				$.set_text(text_2, `${$.get(idx) + 1} of ${pages.length ?? ''} `);
				styles = $.set_style(div_6, '', styles, { width: `${$.get(progress)}%` });
			});

			$.append($$anchor, nav_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isRef)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}