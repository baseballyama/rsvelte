import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatDate } from './util';

export default function Call_hierarchy_import($$anchor, $$props) {
	$.push($$props, true);
	formatDate(new Date());

	function foo() {
		formatDate(new Date());
	}

	foo();
	$.next();

	var text = $.text();

	$.template_effect(($0) => $.set_text(text, $0), [() => formatDate(new Date())]);
	$.append($$anchor, text);
	$.pop();
}