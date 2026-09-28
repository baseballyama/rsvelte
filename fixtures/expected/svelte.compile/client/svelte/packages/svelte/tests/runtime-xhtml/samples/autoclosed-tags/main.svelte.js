import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul><li></li><li></li></ul> <dl><dt></dt><dd></dd><dd></dd></dl> <p></p><p></p><div></div> <ruby><rp></rp><rt></rt><rt></rt></ruby> <select><option></option><optgroup></optgroup><optgroup></optgroup></select> <table><thead></thead><tbody></tbody><tfoot></tfoot><tbody><tr><td></td><th></th></tr><tr></tr></tbody></table>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(12);
	$.append($$anchor, fragment);
}