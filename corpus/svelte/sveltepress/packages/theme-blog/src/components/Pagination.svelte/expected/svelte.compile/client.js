import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { paginationWindow } from '../pagination.js';

var root = $.from_html(`<a class="sp-pg__nav svelte-1i0lfv7">← Prev</a>`);
var root_1 = $.from_html(`<span class="sp-pg__sep svelte-1i0lfv7">…</span>`);
var root_2 = $.from_html(`<a> </a>`);
var root_3 = $.from_html(`<a class="sp-pg__nav svelte-1i0lfv7">Next →</a>`);
var root_4 = $.from_html(`<nav class="sp-pg svelte-1i0lfv7" aria-label="Pagination"><!> <!> <!></nav>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	const totalPages = $.derived(() => Math.max(1, Math.ceil($$props.total / $$props.pageSize)));
	const items = $.derived(() => paginationWindow($$props.page, $.get(totalPages)));

	function href(n) {
		return n === 1 ? `${base}/` : `${base}/page/${n}/`;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var nav = root_4();
			var node_1 = $.child(nav);

			{
				var consequent = ($$anchor) => {
					var a = root();

					$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => href($$props.page - 1)]);
					$.append($$anchor, a);
				};

				$.if(node_1, ($$render) => {
					if ($$props.page > 1) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $.get(items), $.index, ($$anchor, it) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var span = root_1();

						$.append($$anchor, span);
					};

					var alternate = ($$anchor) => {
						var a_1 = root_2();
						let classes;
						var text = $.only_child(a_1, true);

						$.template_effect(
							($0) => {
								classes = $.set_class(a_1, 1, 'sp-pg__num svelte-1i0lfv7', null, classes, { 'is-active': $.get(it) === $$props.page });
								$.set_attribute(a_1, 'href', $0);
								$.set_attribute(a_1, 'aria-current', $.get(it) === $$props.page ? 'page' : undefined);
								$.set_text(text, $.get(it));
							},
							[() => href($.get(it))]
						);

						$.append($$anchor, a_1);
					};

					$.if(node_3, ($$render) => {
						if ($.get(it) === '…') $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			var node_4 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var a_2 = root_3();

					$.template_effect(($0) => $.set_attribute(a_2, 'href', $0), [() => href($$props.page + 1)]);
					$.append($$anchor, a_2);
				};

				$.if(node_4, ($$render) => {
					if ($$props.page < $.get(totalPages)) $$render(consequent_2);
				});
			}

			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node, ($$render) => {
			if ($.get(totalPages) > 1) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}