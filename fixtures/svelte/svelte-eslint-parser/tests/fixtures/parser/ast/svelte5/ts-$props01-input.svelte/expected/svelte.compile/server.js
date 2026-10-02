import * as $ from 'svelte/internal/server';

export default function Ts_$props01_input($$renderer, $$props) {
	let { a, b, c, $$slots, $$events, ...everythingElse } = $$props;

	$$renderer.push(`<!---->${$.escape(a)}
${$.escape(b)}
${$.escape(c)}
${$.escape(everythingElse)}`);
}