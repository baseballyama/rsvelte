import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import classes from '../utils/classes.js';

var root = $.from_html(`<div><div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div></div>`);

export default function Loading($$anchor, $$props) {
	$.push($$props, true);

	let _class = null;

	var $$exports = {
		get class() {
			return _class;
		},

		set class($$value) {
			_class = $$value;
		}
	};

	var div = root();

	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(classes('spinner', _class))]);
	$.append($$anchor, div);

	return $.pop($$exports);
}