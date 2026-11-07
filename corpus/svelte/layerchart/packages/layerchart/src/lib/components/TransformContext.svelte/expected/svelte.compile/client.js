import 'svelte/internal/disclose-version';
import { TransformState } from '$lib/states/transform.svelte.js';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'state',
	'onwheel',
	'onpointerdown',
	'onpointermove',
	'ontouchmove',
	'onpointerup',
	'onpointercancel',
	'ondblclick',
	'onclickcapture',
	'ref',
	'children',
	'class',
	'mode',
	'axis',
	'motion',
	'processTranslate',
	'disablePointer',
	'scrollMode',
	'clickDistance',
	'initialTranslate',
	'initialScale',
	'onTransform',
	'ondragstart',
	'ondragend',
	'scaleExtent',
	'translateExtent',
	'constrain',
	'inertia',
	'pinch',
	'scrollActivationKey'
]);

var root = $.from_html(`<div><!></div>`);

export default function TransformContext($$anchor, $$props) {
	$.push($$props, true);

	let stateProp = $.prop($$props, 'state', 15),
		onwheel = $.prop($$props, 'onwheel', 3, () => {}),
		onpointerdown = $.prop($$props, 'onpointerdown', 3, () => {}),
		onpointermove = $.prop($$props, 'onpointermove', 3, () => {}),
		ontouchmove = $.prop($$props, 'ontouchmove', 3, () => {}),
		onpointerup = $.prop($$props, 'onpointerup', 3, () => {}),
		onpointercancel = $.prop($$props, 'onpointercancel', 3, () => {}),
		ondblclick = $.prop($$props, 'ondblclick', 3, () => {}),
		onclickcapture = $.prop($$props, 'onclickcapture', 3, () => {}),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const options = {
		mode: $$props.mode,
		axis: $$props.axis,
		motion: $$props.motion,
		processTranslate: $$props.processTranslate,
		disablePointer: $$props.disablePointer,
		scrollMode: $$props.scrollMode,
		clickDistance: $$props.clickDistance,
		initialTranslate: $$props.initialTranslate,
		initialScale: $$props.initialScale,
		onTransform: $$props.onTransform,
		ondragstart: $$props.ondragstart,
		ondragend: $$props.ondragend,
		scaleExtent: $$props.scaleExtent,
		translateExtent: $$props.translateExtent,
		constrain: $$props.constrain,
		inertia: $$props.inertia,
		pinch: $$props.pinch,
		scrollActivationKey: $$props.scrollActivationKey
	};

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const ctx = getChartContext();

	// Create TransformState instance
	const transformState = new TransformState(ctx, options);

	// Sync initial transform values when they change (e.g., when projection changes for geo transforms)
	$.user_pre_effect(() => {
		const newTranslate = $$props.initialTranslate ?? { x: 0, y: 0 };
		const newScale = $$props.initialScale ?? 1;

		// Only reset if values actually changed from current initial values
		if (newTranslate.x !== transformState.initialTranslate.x || newTranslate.y !== transformState.initialTranslate.y || newScale !== transformState.initialScale) {
			transformState.initialTranslate = newTranslate;
			transformState.initialScale = newScale;
			transformState.reset();
		}
	});

	$.user_pre_effect(() => {
		if ($$props.scrollMode !== undefined) {
			transformState.scrollMode = $$props.scrollMode;
		}
	});

	$.user_pre_effect(() => {
		transformState.processTranslate = $$props.processTranslate;
	});

	$.user_pre_effect(() => {
		transformState.disablePointer = $$props.disablePointer ?? false;
	});

	$.user_pre_effect(() => {
		transformState.constrain = $$props.constrain;
	});

	$.user_pre_effect(() => {
		transformState.scaleExtent = $$props.scaleExtent;
	});

	$.user_pre_effect(() => {
		transformState.translateExtent = $$props.translateExtent;
	});

	$.user_pre_effect(() => {
		if ($$props.inertia === true) {
			transformState.inertia = {
				enabled: true,
				decay: 0.99,
				minVelocity: 0.1,
				maxVelocity: Infinity,
				velocityWindow: 160
			};
		} else if (typeof $$props.inertia === 'object') {
			transformState.inertia = {
				enabled: true,
				decay: $$props.inertia.decay ?? 0.99,
				minVelocity: $$props.inertia.minVelocity ?? 0.1,
				maxVelocity: $$props.inertia.maxVelocity ?? Infinity,
				velocityWindow: $$props.inertia.velocityWindow ?? 160
			};
		} else {
			transformState.inertia = {
				enabled: false,
				decay: 0.99,
				minVelocity: 0.1,
				maxVelocity: Infinity,
				velocityWindow: 160
			};
		}
	});

	$.user_pre_effect(() => {
		transformState.pinch = $$props.pinch ?? true;
	});

	$.user_pre_effect(() => {
		transformState.scrollActivationKey = $$props.scrollActivationKey;
	});

	// Bind `state` prop
	stateProp(transformState);

	function onPointerDown(e) {
		onpointerdown()?.(e);
		transformState.onPointerDown(e);
	}

	function onPointerMove(e) {
		onpointermove()?.(e);
		transformState.onPointerMove(e);
	}

	function onPointerUp(e) {
		onpointerup()?.(e);
		transformState.onPointerUp(e);
	}

	function onPointerCancel(e) {
		onpointercancel()?.(e);
		transformState.onPointerCancel(e);
	}

	function onClick(e) {
		onclickcapture()?.(e);

		if (transformState.dragging) {
			// Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
			e.stopPropagation();
		}
	}

	function onDoubleClick(e) {
		ondblclick()?.(e);
		transformState.onDoubleClick(e);
	}

	function onWheel(e) {
		onwheel()?.(e);
		transformState.onWheel(e);
	}

	var div = root();

	var event_handler = (e) => {
		ontouchmove()?.(e);

		// Touch events cause pointer events to be interrupted.
		// Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
		// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
		if (transformState.mode !== 'none' && !transformState.disablePointer) {
			e.preventDefault();
		}
	};

	$.attribute_effect(
		div,
		() => ({
			onwheel: onWheel,
			onpointerdown: onPointerDown,
			onpointermove: onPointerMove,
			ontouchmove: event_handler,
			onpointerup: onPointerUp,
			onpointercancel: onPointerCancel,
			ondblclick: onDoubleClick,
			onclickcapture: onClick,
			class: ['lc-transform-context', $$props.class],
			...restProps,
			[$.STYLE]: {
				'touch-action': $$props.mode && $$props.mode !== 'none' && !$$props.disablePointer ? 'none' : undefined
			}
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1fzgqyj'
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ transformState }));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}