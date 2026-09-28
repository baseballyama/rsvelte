import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";

export default function Visually_hidden($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, child, $$slots, $$events, ...restProps } = $$props;

		const style = {
			position: "absolute",
			border: 0,
			width: "1px",
			display: "inline-block",
			height: "1px",
			padding: 0,
			margin: "-1px",
			overflow: "hidden",
			clip: "rect(0 0 0 0)",
			whiteSpace: "nowrap",
			wordWrap: "normal"
		};

		const mergedProps = $.derived(() => mergeProps(restProps, { style }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}