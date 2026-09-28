import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AutoValue } from '$lib';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <hr/> <!> <pre>Number Value: <span> </span></pre> <pre>Number 1 Internal: <span> </span></pre> <pre>Number 1 External: <span> </span></pre> <pre>Number 2 Internal: <span> </span></pre> <pre>Number 2 External: <span> </span></pre> <pre>Color Value: <span> </span></pre> <pre>Color 1 Internal: <span> </span></pre> <pre>Color 1 External: <span> </span></pre> <pre>Color 2 Internal: <span> </span></pre> <pre>Color 2 External: <span> </span></pre> <pre>Point Value: <span> </span></pre> <pre>Point 1 Internal: <span> </span></pre> <pre>Point 1 External: <span> </span></pre> <pre>Point 2 Internal: <span> </span></pre> <pre>Point 2 External: <span> </span></pre> <pre>Text Value: <span> </span></pre> <pre>Text 1 Internal: <span> </span></pre> <pre>Text 1 External: <span> </span></pre> <pre>Text 2 Internal: <span> </span></pre> <pre>Text 2 External: <span> </span></pre>`, 1);

export default function TestAutoValue($$anchor) {
	let number = 0;
	let color = '#ff00ff';
	let colorArray = { r: 0, g: 0, b: 255 };
	let point = { x: 0, y: 0 };
	let text = 'Cosmic manifold';
	let number1InternalEventCount = 0;
	let number1ExternalEventCount = 0;
	let number2InternalEventCount = 0;
	let number2ExternalEventCount = 0;
	let color1InternalEventCount = 0;
	let color1ExternalEventCount = 0;
	let color2InternalEventCount = 0;
	let color2ExternalEventCount = 0;
	let point1InternalEventCount = 0;
	let point1ExternalEventCount = 0;
	let point2InternalEventCount = 0;
	let point2ExternalEventCount = 0;
	let text1InternalEventCount = 0;
	let text1ExternalEventCount = 0;
	let text2InternalEventCount = 0;
	let text2ExternalEventCount = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	AutoValue(node, {
		label: 'Number 1',
		get value() {
			return number;
		},

		set value($$value) {
			number = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					number1InternalEventCount++;
				} else {
					number1ExternalEventCount++;
				}
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	AutoValue(node_1, {
		label: 'Number 2',
		get value() {
			return number;
		},

		set value($$value) {
			number = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					number2InternalEventCount++;
				} else {
					number2ExternalEventCount++;
				}
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	AutoValue(node_2, {
		label: 'Color 1',
		get value() {
			return color;
		},

		set value($$value) {
			color = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					color1InternalEventCount++;
				} else {
					color1ExternalEventCount++;
				}
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	AutoValue(node_3, {
		label: 'Color 2',
		get value() {
			return color;
		},

		set value($$value) {
			color = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					color2InternalEventCount++;
				} else {
					color2ExternalEventCount++;
				}
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	AutoValue(node_4, {
		label: 'Point 1',
		get value() {
			return point;
		},

		set value($$value) {
			point = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					point1InternalEventCount++;
				} else {
					point1ExternalEventCount++;
				}
			}
		}
	});

	var node_5 = $.sibling(node_4, 2);

	AutoValue(node_5, {
		label: 'Point 2',
		get value() {
			return point;
		},

		set value($$value) {
			point = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					point2InternalEventCount++;
				} else {
					point2ExternalEventCount++;
				}
			}
		}
	});

	var node_6 = $.sibling(node_5, 2);

	AutoValue(node_6, {
		label: 'Text 1',
		get value() {
			return text;
		},

		set value($$value) {
			text = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					text1InternalEventCount++;
				} else {
					text1ExternalEventCount++;
				}
			}
		}
	});

	var node_7 = $.sibling(node_6, 2);

	AutoValue(node_7, {
		label: 'Text 2',
		get value() {
			return text;
		},

		set value($$value) {
			text = $$value;
		},

		$$events: {
			change: (event) => {
				if (event.detail.origin === 'internal') {
					text2InternalEventCount++;
				} else {
					text2ExternalEventCount++;
				}
			}
		}
	});

	var node_8 = $.sibling(node_7, 4);

	AutoValue(node_8, {
		label: 'Color Array',
		get value() {
			return colorArray;
		},

		set value($$value) {
			colorArray = $$value;
		}
	});

	var pre = $.sibling(node_8, 2);
	var span = $.sibling($.child(pre));
	var text_1 = $.only_child(span, true);

	$.reset(pre);

	var pre_1 = $.sibling(pre, 2);
	var span_1 = $.sibling($.child(pre_1));
	var text_2 = $.only_child(span_1, true);

	$.reset(pre_1);

	var pre_2 = $.sibling(pre_1, 2);
	var span_2 = $.sibling($.child(pre_2));
	var text_3 = $.only_child(span_2, true);

	$.reset(pre_2);

	var pre_3 = $.sibling(pre_2, 2);
	var span_3 = $.sibling($.child(pre_3));
	var text_4 = $.only_child(span_3, true);

	$.reset(pre_3);

	var pre_4 = $.sibling(pre_3, 2);
	var span_4 = $.sibling($.child(pre_4));
	var text_5 = $.only_child(span_4, true);

	$.reset(pre_4);

	var pre_5 = $.sibling(pre_4, 2);
	var span_5 = $.sibling($.child(pre_5));
	var text_6 = $.only_child(span_5, true);

	$.reset(pre_5);

	var pre_6 = $.sibling(pre_5, 2);
	var span_6 = $.sibling($.child(pre_6));
	var text_7 = $.only_child(span_6, true);

	$.reset(pre_6);

	var pre_7 = $.sibling(pre_6, 2);
	var span_7 = $.sibling($.child(pre_7));
	var text_8 = $.only_child(span_7, true);

	$.reset(pre_7);

	var pre_8 = $.sibling(pre_7, 2);
	var span_8 = $.sibling($.child(pre_8));
	var text_9 = $.only_child(span_8, true);

	$.reset(pre_8);

	var pre_9 = $.sibling(pre_8, 2);
	var span_9 = $.sibling($.child(pre_9));
	var text_10 = $.only_child(span_9, true);

	$.reset(pre_9);

	var pre_10 = $.sibling(pre_9, 2);
	var span_10 = $.sibling($.child(pre_10));
	var text_11 = $.only_child(span_10, true);

	$.reset(pre_10);

	var pre_11 = $.sibling(pre_10, 2);
	var span_11 = $.sibling($.child(pre_11));
	var text_12 = $.only_child(span_11, true);

	$.reset(pre_11);

	var pre_12 = $.sibling(pre_11, 2);
	var span_12 = $.sibling($.child(pre_12));
	var text_13 = $.only_child(span_12, true);

	$.reset(pre_12);

	var pre_13 = $.sibling(pre_12, 2);
	var span_13 = $.sibling($.child(pre_13));
	var text_14 = $.only_child(span_13, true);

	$.reset(pre_13);

	var pre_14 = $.sibling(pre_13, 2);
	var span_14 = $.sibling($.child(pre_14));
	var text_15 = $.only_child(span_14, true);

	$.reset(pre_14);

	var pre_15 = $.sibling(pre_14, 2);
	var span_15 = $.sibling($.child(pre_15));
	var text_16 = $.only_child(span_15, true);

	$.reset(pre_15);

	var pre_16 = $.sibling(pre_15, 2);
	var span_16 = $.sibling($.child(pre_16));
	var text_17 = $.only_child(span_16, true);

	$.reset(pre_16);

	var pre_17 = $.sibling(pre_16, 2);
	var span_17 = $.sibling($.child(pre_17));
	var text_18 = $.only_child(span_17, true);

	$.reset(pre_17);

	var pre_18 = $.sibling(pre_17, 2);
	var span_18 = $.sibling($.child(pre_18));
	var text_19 = $.only_child(span_18, true);

	$.reset(pre_18);

	var pre_19 = $.sibling(pre_18, 2);
	var span_19 = $.sibling($.child(pre_19));
	var text_20 = $.only_child(span_19, true);

	$.reset(pre_19);

	$.template_effect(() => {
		$.set_text(text_1, number);
		$.set_text(text_2, number1InternalEventCount);
		$.set_text(text_3, number1ExternalEventCount);
		$.set_text(text_4, number2InternalEventCount);
		$.set_text(text_5, number2ExternalEventCount);
		$.set_text(text_6, color);
		$.set_text(text_7, color1InternalEventCount);
		$.set_text(text_8, color1ExternalEventCount);
		$.set_text(text_9, color2InternalEventCount);
		$.set_text(text_10, color2ExternalEventCount);
		$.set_text(text_11, point);
		$.set_text(text_12, point1InternalEventCount);
		$.set_text(text_13, point1ExternalEventCount);
		$.set_text(text_14, point2InternalEventCount);
		$.set_text(text_15, point2ExternalEventCount);
		$.set_text(text_16, text);
		$.set_text(text_17, text1InternalEventCount);
		$.set_text(text_18, text1ExternalEventCount);
		$.set_text(text_19, text2InternalEventCount);
		$.set_text(text_20, text2ExternalEventCount);
	});

	$.append($$anchor, fragment);
}