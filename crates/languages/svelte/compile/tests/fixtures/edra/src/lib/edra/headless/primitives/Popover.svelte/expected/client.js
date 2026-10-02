import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

var root = $.from_html(`<div style="position: fixed; width: max-content; left: 0; top: 0;"><!></div>`);
var root_1 = $.from_html(`<div class="popover-wrapper svelte-dbdywc"><button type="button"><!></button> <!></div>`);

export default function Popover($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		side = $.prop($$props, 'side', 3, 'bottom'),
		align = $.prop($$props, 'align', 3, 'center'),
		className = $.prop($$props, 'class', 3, '');

	let triggerEl = $.state(null);
	let popoverEl = $.state(null);

	$.user_effect(() => {
		if (open() && $.get(triggerEl) && $.get(popoverEl)) {
			updatePosition();
		}
	});

	function updatePosition() {
		if (!$.get(triggerEl) || !$.get(popoverEl)) return;

		const placement = `${side()}${align() !== 'center' ? '-' + align() : ''}`;

		computePosition($.get(triggerEl), $.get(popoverEl), {
			placement,
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		}).then(({ x, y }) => {
			if ($.get(popoverEl)) {
				$.get(popoverEl).style.left = `${x}px`;
				$.get(popoverEl).style.top = `${y}px`;
			}
		});
	}

	function handleOutsideClick(event) {
		if (!open()) return;

		const target = event.target;

		if ($.get(triggerEl) && !$.get(triggerEl).contains(target) && $.get(popoverEl) && !$.get(popoverEl).contains(target)) {
			open(false);
		}
	}

	var div = root_1();

	$.event('click', $.document, handleOutsideClick);

	var button = $.child(div);
	var node = $.child(button);

	$.snippet(node, () => $$props.trigger);
	$.reset(button);
	$.bind_this(button, ($$value) => $.set(triggerEl, $$value), () => $.get(triggerEl));

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			$.snippet(node_2, () => $$props.children);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(popoverEl, $$value), () => $.get(popoverEl));
			$.template_effect(() => $.set_class(div_1, 1, `edra-popover-content ${className() ?? ''}`, 'svelte-dbdywc'));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (open()) $$render(consequent);
		});
	}

	$.reset(div);

	$.delegated('click', button, (e) => {
		e.stopPropagation();
		open(!open());
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);