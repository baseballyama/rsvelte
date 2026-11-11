import * as $ from "svelte/internal/server";
export default function Bind_elements($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = void 0, w = void 0 } = $$props;
		let t = 0;
		let p = true;
		let v = 1;
		let files = void 0;
		let f = false;
		let rect = void 0;
		let h = 0;
		let html = "";
		let ind = false;
		let d = 0;
		let text = "";
		let ty = "text";
		function act() {}
		$$renderer.push(`<video></video> <audio></audio> <details${$.attr("open", open, true)}></details> <details${$.attr("open", p, true)}></details> <input type="file"/> <input type="file"/> <input/> <div></div> <div contenteditable="">`);
		if (html) {
			$$renderer.push(`${html}`);
		} else {}
		$$renderer.push(`</div> <p contenteditable="true">`);
		const $$body = $.escape(text);
		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}
		$$renderer.push(`</p> <input type="checkbox"${$.attr("checked", f, true)}/> <input${$.attr("type", ty)}${$.attr("value", text)}/> <input type="checkbox"${$.attr("value", text)}/> <img alt=""/> <input${$.attr("value", text)}/> <input${$.attr("value", w)}/> <input${$.attr("value", (() => text)())}/> `);
		$$renderer.select({
			value: text,
			...{}
		}, ($$renderer) => {
			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`a`);
			});
		});
		$.bind_props($$props, {
			open,
			w
		});
	});
}
