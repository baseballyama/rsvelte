import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<ul><li></li><li></li></ul> <dl><dt></dt><dd></dd><dd></dd></dl> <p></p><p></p><div></div> <ruby><rp></rp><rt></rt><rt></rt></ruby> <select>`);
	$$renderer.option({}, ($$renderer) => {});
	$$renderer.push(`<optgroup></optgroup><optgroup></optgroup></select> <table><thead></thead><tbody></tbody><tfoot></tfoot><tbody><tr><td></td><th></th></tr><tr></tr></tbody></table>`);
}