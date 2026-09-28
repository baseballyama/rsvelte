import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	var div = root();

	$.event('gotpointercapture', div, (e) => {
		e.target.dataset.gotCaptured = "true";
	});

	$.event('lostpointercapture', div, (e) => {
		e.target.dataset.lostCaptured = "true";
	});

	$.append($$anchor, div);
}