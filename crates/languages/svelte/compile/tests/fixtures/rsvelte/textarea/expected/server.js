import * as $ from "svelte/internal/server";
export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = "";
		let { p = void 0 } = $$props;
		let rest = {};
		$$renderer.push(`<textarea>`);
		const $$body = $.escape(text);
		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}
		$$renderer.push(`</textarea> <textarea placeholder="x">`);
		const $$body_1 = $.escape(p);
		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}
		$$renderer.push(`</textarea> <textarea>`);
		const $$body_2 = $.escape("a");
		if ($$body_2) {
			$$renderer.push(`${$$body_2}`);
		} else {}
		$$renderer.push(`</textarea> <textarea>`);
		const $$body_3 = $.escape(text);
		if ($$body_3) {
			$$renderer.push(`${$$body_3}`);
		} else {}
		$$renderer.push(`</textarea> <textarea>`);
		const $$body_4 = $.escape("\n\nx");
		if ($$body_4) {
			$$renderer.push(`${$$body_4}`);
		} else {}
		$$renderer.push(`</textarea> <textarea>static
text</textarea> <textarea>
lead</textarea> <textarea${$.attributes({ ...rest })}>`);
		const $$body_5 = $.escape(text);
		if ($$body_5) {
			$$renderer.push(`${$$body_5}`);
		} else {}
		$$renderer.push(`</textarea> <textarea></textarea> <textarea>`);
		const $$body_6 = $.escape(true);
		if ($$body_6) {
			$$renderer.push(`${$$body_6}`);
		} else {}
		$$renderer.push(`</textarea>`);
		$.bind_props($$props, { p });
	});
}
