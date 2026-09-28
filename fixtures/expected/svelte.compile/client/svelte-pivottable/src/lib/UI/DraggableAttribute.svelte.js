import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import Draggable from "./Draggable.svelte";
import FilterBox from "./FilterBox.svelte";

var root = $.from_html(`<li class="handle"><span> <span class="pvtTriangle" role="presentation"></span></span> <!></li>`);

export default function DraggableAttribute($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let valueFilter = getContext("valueFilter");

	let is_empty = $.derived(() => valueFilter[$$props.name]
		? Object.keys(valueFilter[$$props.name]).length === 0
		: true);

	const toggleOpen = () => $.set(open, !$.get(open));
	var li = root();
	var span = $.child(li);
	var text = $.child(span);
	var span_1 = $.sibling(text);

	span_1.textContent = ' \n            ▾';
	$.reset(span);

	var node = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			Draggable($$anchor, {
				handle: '.pvtDragHandle',
				close: '.pvtCloseX',
				onclose: toggleOpen,
				children: ($$anchor, $$slotProps) => {
					FilterBox($$anchor, {
						get name() {
							return $$props.name;
						},

						get values() {
							return $$props.attrValues;
						},

						get menuLimit() {
							return $$props.menuLimit;
						}
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.reset(li);

	$.template_effect(() => {
		$.set_attribute(li, 'data-id', $$props.name);
		$.set_class(span, 1, `pvtAttr ${$.get(is_empty) ? "" : "pvtFilteredAttribute"}`);
		$.set_text(text, `${$$props.name ?? ''} `);
	});

	$.delegated('click', span_1, toggleOpen);
	$.event('keypress', span_1, toggleOpen);
	$.append($$anchor, li);
	$.pop();
}

$.delegate(['click']);