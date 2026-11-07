import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import classes from '../utils/classes.js';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`);

export default function Paperclip($$anchor, $$props) {
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