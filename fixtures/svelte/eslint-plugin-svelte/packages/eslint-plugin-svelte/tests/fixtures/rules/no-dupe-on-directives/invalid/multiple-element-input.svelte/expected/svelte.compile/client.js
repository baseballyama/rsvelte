import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div><div></div> <div></div> <div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div> <div></div> <div></div></div></div>`);

export default function Multiple_element_input($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);

	$.reset(div_1);

	var div_7 = $.sibling(div_1, 2);
	var div_8 = $.child(div_7);
	var div_9 = $.sibling(div_8, 2);
	var div_10 = $.sibling(div_9, 2);
	var div_11 = $.sibling(div_10, 2);
	var div_12 = $.sibling(div_11, 2);

	$.reset(div_7);
	$.reset(div);

	$.event('mousemove', div_2, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_3, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_3, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_4, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_5, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_5, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_6, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_1, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_1, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_8, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_8, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_9, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_10, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_10, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_11, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_12, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_12, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div_7, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mousemove', div, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, div);
}