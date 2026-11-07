import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { arrow, autoUpdate, computePosition, offset } from '@floating-ui/dom';
import { onMount } from 'svelte';
import teleport from '../actions/teleport.js';
import '@shikijs/twoslash/style-rich.css';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'show',
	'alwaysShow',
	'placement',
	'floatingClass',
	'content'
]);

var root = $.from_html(`<span><!> <div role="tooltip"><div class="arrow svelte-p2yhcs"></div> <!></div></span>`);

export default function Floating($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 7, false),
		alwaysShow = $.prop($$props, 'alwaysShow', 3, false),
		placement = $.prop($$props, 'placement', 3, 'bottom-start'),
		rest = $.rest_props($$props, rest_excludes);

	let container;
	let floatingContent;
	let arrowEl;

	const recomputePosition = (nextShow = show()) => {
		if (alwaysShow() || nextShow) {
			computePosition(container, floatingContent, {
				strategy: 'fixed',
				placement: placement(),
				middleware: [offset(5), arrow({ element: arrowEl })]
			}).then(({ x, y, middlewareData, placement }) => {
				Object.assign(floatingContent.style, { left: `${x}px`, top: `${y}px` });

				const side = placement.split('-')[0];
				const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };

				const translate = {
					top: 'translateY(-50%)',
					right: 'translateX(50%)',
					bottom: 'translateY(50%)',
					left: 'translateX(-50%)'
				};

				if (middlewareData.arrow) {
					Object.assign(arrowEl.style, {
						[staticSide[side]]: `${-arrowEl.offsetWidth}px`,
						borderWidth: `${side === 'bottom' || side === 'left' ? '1px' : 0} ${side === 'left' || side === 'top' ? '1px' : 0} ${side === 'top' || side === 'right' ? '1px' : 0} ${side === 'bottom' || side === 'right' ? '1px' : 0}`,
						transform: `${translate[side]} rotate(45deg)`
					});
				}
			});
		}
	};

	onMount(() => {
		recomputePosition();

		return autoUpdate(container, floatingContent, recomputePosition);
	});

	$.user_effect(() => {
		recomputePosition(show());
	});

	var span = root();
	var event_handler = () => show(true);
	var event_handler_1 = () => show(false);

	$.attribute_effect(
		span,
		() => ({
			class: 'container',
			onmouseenter: event_handler,
			onmouseleave: event_handler_1,
			role: 'tooltip',
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-p2yhcs'
	);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);

	var div = $.sibling(node, 2);
	let classes;
	var div_1 = $.child(div);

	$.bind_this(div_1, ($$value) => arrowEl = $$value, () => arrowEl);

	var node_1 = $.sibling(div_1, 2);

	$.snippet(node_1, () => $$props.content ?? $.noop);
	$.reset(div);
	$.action(div, ($$node) => teleport?.($$node));
	$.bind_this(div, ($$value) => floatingContent = $$value, () => floatingContent);
	$.reset(span);
	$.bind_this(span, ($$value) => container = $$value, () => container);
	$.template_effect(() => classes = $.set_class(div, 1, `floating-content-wrapper ${$$props.floatingClass ? ` ${$$props.floatingClass}` : ''}`, 'svelte-p2yhcs', classes, { 'always-show': alwaysShow(), show: alwaysShow() || show() }));
	$.event('mouseenter', div, () => show(true));
	$.event('mouseleave', div, () => show(false));
	$.append($$anchor, span);
	$.pop();
}