import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'size',
	'isActive',
	'page',
	'children'
]);

export default function Pagination_link($$anchor, $$props) {
	$.push($$props, true);

	const Fallback = ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $$props.page.value));
		$.append($$anchor, text);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, "icon"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => $$props.isActive ? "page" : undefined);

		let $1 = $.derived(() => cn(
			buttonVariants({
				size: size(),
				variant: $$props.isActive ? "outline" : "ghost"
			}),
			"cn-pagination-link",
			$$props.class
		));

		$.component(node, () => PaginationPrimitive.Page, ($$anchor, PaginationPrimitive_Page) => {
			PaginationPrimitive_Page($$anchor, $.spread_props(
				{
					get page() {
						return $$props.page;
					},

					get 'aria-current'() {
						return $.get($0);
					},
					'data-slot': 'pagination-link',
					get 'data-active'() {
						return $$props.isActive;
					},

					get 'data-size'() {
						return size();
					},

					get class() {
						return $.get($1);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								Fallback($$anchor);
							};

							$.if(node_1, ($$render) => {
								if ($$props.children) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}