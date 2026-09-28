import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { listGroup } from "./theme";
import clsx from "clsx";
import ListgroupItem from "./ListgroupItem.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { setListGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'items',
	'active',
	'onclick',
	'horizontal',
	'rounded',
	'border',
	'class',
	'itemClass',
	'iconClass'
]);

export default function Listgroup($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("listGroup"));

	const base = $.derived(() => listGroup({
		rounded: $$props.rounded,
		border: $$props.border,
		horizontal: $$props.horizontal,
		class: clsx($.get(theme), $$props.class)
	}));

	let tag = $.derived(() => $$props.active ? "div" : "ul");

	// Create reactive context using getters
	const context = {
		get active() {
			return $$props.active;
		},

		get horizontal() {
			return $$props.horizontal;
		}
	};

	setListGroupContext(context);

	function createItemClickHandler() {
		return function (event) {
			if ($$props.onclick) {
				$$props.onclick(event);
			}
		};
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $.get(tag), false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...restProps, class: $.get(base) }));

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.each(node_2, 17, () => $$props.items, $.index, ($$anchor, item) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.snippet(node_4, () => $$props.children, () => $.get(item));
							$.append($$anchor, fragment_4);
						};

						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => clsx($$props.itemClass));
								let $1 = $.derived(() => clsx($$props.iconClass));
								let $2 = $.derived(createItemClickHandler);

								ListgroupItem($$anchor, {
									href: undefined,
									get class() {
										return $.get($0);
									},

									get iconClass() {
										return $.get($1);
									},

									get active() {
										return $$props.active;
									},

									get horizontal() {
										return $$props.horizontal;
									},

									get onclick() {
										return $.get($2);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item)));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							}
						};

						var alternate = ($$anchor) => {
							{
								let $0 = $.derived(() => clsx($$props.itemClass));
								let $1 = $.derived(() => clsx($$props.iconClass));
								let $2 = $.derived(() => $.get(item).onclick ?? createItemClickHandler());

								ListgroupItem($$anchor, $.spread_props(
									{
										get href() {
											return $.get(item).href;
										},

										get class() {
											return $.get($0);
										},

										get iconClass() {
											return $.get($1);
										},

										get active() {
											return $$props.active;
										},

										get horizontal() {
											return $$props.horizontal;
										}
									},
									() => $.get(item),
									{
										get onclick() {
											return $.get($2);
										}
									}
								));
							}
						};

						$.if(node_3, ($$render) => {
							if ($$props.children) $$render(consequent); else if (typeof $.get(item) === "string") $$render(consequent_1, 1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				});

				$.append($$anchor, fragment_2);
			};

			var alternate_1 = ($$anchor) => {
				var fragment_8 = $.comment();
				var node_5 = $.first_child(fragment_8);

				$.snippet(node_5, () => $$props.children ?? $.noop, () => $$props.items?.[0] ?? "");
				$.append($$anchor, fragment_8);
			};

			$.if(node_1, ($$render) => {
				if ($$props.items?.length) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}