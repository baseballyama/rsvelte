import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

var root = $.from_html(`<div role="tooltip"><!> <div class="tooltip svelte-dib29m" role="tooltip"><!> <div class="arrow svelte-dib29m"></div></div></div>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(void 0);
	let tooltipEl = $.state(void 0);
	let arrowEl = $.state(void 0);

	function showTooltip() {
		if (!$.get(tooltipEl)) return;

		$.get(tooltipEl).style.display = 'block';
		update();
	}

	function hideTooltip() {
		if (!$.get(tooltipEl)) return;

		$.get(tooltipEl).style.display = '';
	}

	async function update() {
		if (!$.get(ref) || !$.get(tooltipEl) || !$.get(arrowEl)) return;

		const { x, y, placement, middlewareData } = await computePosition($.get(ref), $.get(tooltipEl), {
			placement: 'top',
			middleware: [
				offset(2),
				flip(),
				shift({ padding: 5 }),
				arrow({ element: $.get(arrowEl) })
			]
		});

		Object.assign($.get(tooltipEl).style, { left: `${x}px`, top: `${y}px` });

		const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
		const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' })[placement.split('-')[0]];

		if (!staticSide) return;

		Object.assign($.get(arrowEl).style, {
			left: arrowX == null ? '' : `${arrowX}px`,
			top: arrowY == null ? '' : `${arrowY}px`,
			right: '',
			bottom: '',
			[staticSide]: '-4px'
		});
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	$.snippet(node_1, () => $$props.tooltip ?? $.noop);

	var div_2 = $.sibling(node_1, 2);

	$.bind_this(div_2, ($$value) => $.set(arrowEl, $$value), () => $.get(arrowEl));
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(tooltipEl, $$value), () => $.get(tooltipEl));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.event('mouseenter', div, showTooltip);
	$.event('mouseleave', div, hideTooltip);
	$.event('focus', div, showTooltip);
	$.event('blur', div, hideTooltip);
	$.append($$anchor, div);
	$.pop();
}