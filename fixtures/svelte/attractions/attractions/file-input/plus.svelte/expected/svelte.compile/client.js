import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import classes from '../utils/classes.js';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`);

export default function Plus($$anchor, $$props) {
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

	var svg = root();

	$.template_effect(($0) => $.set_class(svg, 0, $0), [() => $.clsx(classes(_class))]);
	$.append($$anchor, svg);

	return $.pop($$exports);
}