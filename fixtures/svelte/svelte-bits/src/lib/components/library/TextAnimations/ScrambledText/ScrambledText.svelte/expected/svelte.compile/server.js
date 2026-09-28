import * as $ from 'svelte/internal/server';
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

export default function ScrambledText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		gsap.registerPlugin(SplitText, ScrambleTextPlugin);

		let {
			radius = 100,
			duration = 1.2,
			speed = 0.5,
			scrambleChars = ".:",
			className = "",
			style = "",
			children
		} = $$props;

		let rootEl = void 0;

		$$renderer.push(`<div${$.attr_class(`m-[7vw] max-w-200 font-mono text-[clamp(14px,4vw,32px)] text-white ${$.stringify(className)}`)}${$.attr_style(style)}><p>`);
		children($$renderer);
		$$renderer.push(`<!----></p></div>`);
	});
}