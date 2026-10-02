import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Handle from './ResizableLayerHandle.svelte';
import Surface from './ResizableLayerSurface.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ResizableLayer($$anchor, $$props) {
	$.push($$props, true);

	const [N, S, E, W] = [1, 2, 4, 8];
	const HANDLES = [N, S, E, W, N | E, N | W, S | E, S | W];
	const SURFACE = N | S | E | W;
	let initialBounds = $.prop($$props, 'initialBounds', 19, () => ({ x0: 160, y0: 160, x1: 480, y1: 480 }));
	let x0 = $.state($.proxy(initialBounds().x0));
	let y0 = $.state($.proxy(initialBounds().y0));
	let x1 = $.state($.proxy(initialBounds().x1));
	let y1 = $.state($.proxy(initialBounds().y1));
	const bounds = $.derived(() => ({ x0: $.get(x0), y0: $.get(y0), x1: $.get(x1), y1: $.get(y1) }));
	let hoveredHandle = $.state(null);
	let draggedHandle = $.state(null);
	let previousTouch = $.state(void 0);
	const active = $.derived(() => Boolean($.get(hoveredHandle) || $.get(draggedHandle)));
	const sortedHandles = $.derived(() => HANDLES.sort((a, b) => a === $.get(hoveredHandle) ? 1 : b === $.get(hoveredHandle) ? -1 : 0));
	const setCursor = ({ style }) => ({ update: (cursor) => style.cursor = cursor });
	var fragment = root();

	$.action($.document.body, ($$node, $$action_arg) => setCursor?.($$node, $$action_arg), () => $.get(active) ? 'pointer' : 'auto');

	$.event('mousemove', $.document.body, ({ movementX, movementY }) => {
		$.set(x0, $.get(x0) + ($.get(draggedHandle) & W && movementX));
		$.set(y0, $.get(y0) + ($.get(draggedHandle) & N && movementY));
		$.set(x1, $.get(x1) + ($.get(draggedHandle) & E && movementX));
		$.set(y1, $.get(y1) + ($.get(draggedHandle) & S && movementY));
	});

	$.event('mouseup', $.document.body, () => $.set(draggedHandle, null));
	$.event('pointerdown', $.document.body, () => $.set(draggedHandle, null));
	$.event('touchstart', $.document.body, (e) => $.set(previousTouch, e.touches[0], true), void 0, true);

	$.event(
		'touchmove',
		$.document.body,
		(e) => {
			const { clientX, clientY } = e.touches[0];
			const movementX = clientX - $.get(previousTouch).clientX;
			const movementY = clientY - $.get(previousTouch).clientY;

			$.set(x0, $.get(x0) + ($.get(draggedHandle) & W && movementX));
			$.set(y0, $.get(y0) + ($.get(draggedHandle) & N && movementY));
			$.set(x1, $.get(x1) + ($.get(draggedHandle) & E && movementX));
			$.set(y1, $.get(y1) + ($.get(draggedHandle) & S && movementY));
			$.set(previousTouch, e.touches[0], true);
		},
		void 0,
		true
	);

	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.content, () => $.get(bounds));

	var node_1 = $.sibling(node, 2);

	Surface(node_1, {
		get bounds() {
			return $.get(bounds);
		},

		get show() {
			return $.get(active);
		},

		onmouseenter: () => {
			$.set(hoveredHandle, SURFACE);
		},

		ontouchstart: () => {
			$.set(draggedHandle, SURFACE);
			$$props.ontouchstart?.();
		},

		onmouseleave: () => {
			$.set(hoveredHandle, null);
		},

		onmousedown: () => {
			$.set(draggedHandle, SURFACE);
			$$props.onmousedown?.();
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 16, () => $.get(sortedHandles), (handle) => handle, ($$anchor, handle) => {
				{
					let $0 = $.derived(() => handle === $.get(hoveredHandle) || handle === $.get(draggedHandle));

					let $1 = $.derived(() => handle & W
						? $.get(x0)
						: handle & E ? $.get(x1) : ($.get(x0) + $.get(x1)) / 2);

					let $2 = $.derived(() => handle & N
						? $.get(y0)
						: handle & S ? $.get(y1) : ($.get(y0) + $.get(y1)) / 2);

					Handle($$anchor, {
						get active() {
							return $.get($0);
						},

						get x() {
							return $.get($1);
						},

						get y() {
							return $.get($2);
						},

						onmouseenter: () => {
							$.set(hoveredHandle, handle, true);
						},

						ontouchstart: () => {
							$.set(draggedHandle, handle, true);
							$$props.ontouchstart?.();
						},
						onmouseleave: () => $.set(hoveredHandle, null),
						onmousedown: () => {
							$.set(draggedHandle, handle, true);
							$$props.onmousedown?.();
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(active)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}