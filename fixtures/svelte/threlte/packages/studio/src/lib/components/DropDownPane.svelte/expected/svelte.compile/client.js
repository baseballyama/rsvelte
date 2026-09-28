import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { arrow, computePosition, offset, shift } from '@floating-ui/dom';
import { Pane } from 'svelte-tweakpane-ui';
import IconButton from './IconButton.svelte';

var root = $.from_html(`<div style="display: contents;"><div><!></div> <div class="tooltip svelte-1gcd9w0" role="menu"><!> <div class="arrow svelte-1gcd9w0"></div></div></div>`);

export default function DropDownPane($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(void 0);
	let tooltipEl = $.state(void 0);
	let arrowEl = $.state(void 0);

	const show = () => {
		if (!$.get(tooltipEl)) return;

		$.get(tooltipEl).style.display = 'block';
		update();
		visible(true);
	};

	const hide = () => {
		if (!$.get(tooltipEl)) return;

		$.get(tooltipEl).style.display = 'none';
		visible(false);
	};

	let placement = $.prop($$props, 'placement', 3, 'bottom'),
		title = $.prop($$props, 'title', 3, ''),
		icon = $.prop($$props, 'icon', 3, 'mdiChevronDown'),
		visible = $.prop($$props, 'visible', 15, false),
		toggle = $.prop($$props, 'toggle', 3, () => {
			if (!visible()) show(); else hide();
		});

	async function update() {
		if (!$.get(ref) || !$.get(tooltipEl) || !$.get(arrowEl)) return;

		const { x, y, placement: finalPlacement, middlewareData } = await computePosition($.get(ref), $.get(tooltipEl), {
			placement: placement(),
			middleware: [
				offset(2),
				shift({ padding: 6 }),
				arrow({ element: $.get(arrowEl) })
			]
		});

		Object.assign($.get(tooltipEl).style, { left: `${x}px`, top: `${y}px` });

		const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
		const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' })[finalPlacement.split('-')[0]];

		if (!staticSide) return;

		Object.assign($.get(arrowEl).style, {
			left: arrowX == null ? '' : `${arrowX}px`,
			top: arrowY == null ? '' : `${arrowY}px`,
			right: '',
			bottom: '',
			[staticSide]: '-4px'
		});
	}

	function clickOutside(element, callbackFunction) {
		function onClick(event) {
			if (event.target && !element.contains(event.target)) {
				callbackFunction();
			}
		}

		document.body.addEventListener('click', onClick);

		return {
			update(newCallbackFunction) {
				callbackFunction = newCallbackFunction;
			},

			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		};
	}

	var $$exports = { show, hide };
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	IconButton(node, {
		get icon() {
			return icon();
		},
		label: 'Toggle Pane',
		onclick: () => {
			toggle()();
		}
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(ref, $$value), () => $.get(ref));

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Pane(node_1, {
		position: 'inline',
		get title() {
			return title();
		},
		expanded: true,
		userExpandable: false,
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node_1, 2);

	$.bind_this(div_3, ($$value) => $.set(arrowEl, $$value), () => $.get(arrowEl));
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => $.set(tooltipEl, $$value), () => $.get(tooltipEl));
	$.reset(div);

	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => {
		hide();
	});

	$.append($$anchor, div);

	return $.pop($$exports);
}