import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pagination } from "./theme";
import PaginationItem from "./PaginationItem.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { setPaginationContext } from "$lib/context";
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'pages',
	'previous',
	'next',
	'prevContent',
	'nextContent',
	'table',
	'size',
	'ariaLabel'
]);

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<nav><ul><!> <!> <!></ul></nav>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	let pages = $.prop($$props, 'pages', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("pagination"));

	// Create context object
	const ctx = {
		get group() {
			return true;
		},

		get table() {
			return $$props.table;
		},

		get size() {
			return $$props.size;
		}
	};

	// Set context during initialization
	setPaginationContext(ctx);

	const paginationCls = $.derived(() => pagination({
		table: $$props.table,
		size: $$props.size,
		class: clsx($.get(theme))
	}));

	var nav = root_1();
	var ul = $.child(nav);
	var node = $.child(ul);

	{
		var consequent_1 = ($$anchor) => {
			var li = root();

			$.attribute_effect(li, () => ({ ...restProps }));

			var node_1 = $.child(li);

			{
				let $0 = $.derived(() => $$props.table
					? "rounded-none rounded-l"
					: "rounded-none  rounded-s-lg");

				PaginationItem(node_1, {
					get size() {
						return $$props.size;
					},
					onclick: () => $$props.previous(),
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment = $.comment();
						var node_2 = $.first_child(fragment);

						{
							var consequent = ($$anchor) => {
								var fragment_1 = $.comment();
								var node_3 = $.first_child(fragment_1);

								$.snippet(node_3, () => $$props.prevContent);
								$.append($$anchor, fragment_1);
							};

							var alternate = ($$anchor) => {
								var text = $.text('Previous');

								$.append($$anchor, text);
							};

							$.if(node_2, ($$render) => {
								if ($$props.prevContent) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				});
			}

			$.reset(li);
			$.append($$anchor, li);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.previous === "function") $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node, 2);

	$.each(node_4, 19, pages, ({ name, href, active, size }, index) => href ?? index, ($$anchor, $$item, index, $$array) => {
		let name = () => $.get($$item).name;
		let href = () => $.get($$item).href;
		let active = () => $.get($$item).active;
		let size = () => $.get($$item).size;
		var li_1 = root();

		$.attribute_effect(li_1, () => ({ ...restProps }));

		var node_5 = $.child(li_1);

		PaginationItem(node_5, {
			get size() {
				return size();
			},

			get active() {
				return active();
			},

			get href() {
				return href();
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, name()));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});

		$.reset(li_1);
		$.append($$anchor, li_1);
	});

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_3 = ($$anchor) => {
			var li_2 = root();

			$.attribute_effect(li_2, () => ({ ...restProps }));

			var node_7 = $.child(li_2);

			{
				let $0 = $.derived(() => $$props.table
					? "rounded-none rounded-r"
					: "rounded-none rounded-e-lg");

				PaginationItem(node_7, {
					get size() {
						return $$props.size;
					},
					onclick: () => $$props.next(),
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_8 = $.first_child(fragment_3);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_9 = $.first_child(fragment_4);

								$.snippet(node_9, () => $$props.nextContent);
								$.append($$anchor, fragment_4);
							};

							var alternate_1 = ($$anchor) => {
								var text_2 = $.text('Next');

								$.append($$anchor, text_2);
							};

							$.if(node_8, ($$render) => {
								if ($$props.nextContent) $$render(consequent_2); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}

			$.reset(li_2);
			$.append($$anchor, li_2);
		};

		$.if(node_6, ($$render) => {
			if (typeof $$props.next === "function") $$render(consequent_3);
		});
	}

	$.reset(ul);
	$.reset(nav);

	$.template_effect(() => {
		$.set_attribute(nav, 'aria-label', $$props.ariaLabel);
		$.set_class(ul, 1, $.clsx($.get(paginationCls)));
	});

	$.append($$anchor, nav);
	$.pop();
}