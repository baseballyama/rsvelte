import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function noop() {}

	let props = {};
	const dynamicTypeValue = "checkbox";
	const dynamicAriaHiddenValue = "false";
	const dynamicRole = "button";

	$$renderer.push(`<div></div> <div aria-hidden="false"></div> <section></section> <main></main> <article></article> <header></header> <footer></footer> <footer></footer> <div class="foo"></div> <a href="http://x.y.z">foo</a> <button>click me</button> <select></select> <input type="button"/> <input${$.attr('type', dynamicTypeValue)}/> <div${$.attributes({ ...props })}></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <input type="hidden"/> <div aria-hidden="true"></div> <div aria-hidden="true"></div> <div aria-hidden="false"></div> <div${$.attr('aria-hidden', dynamicAriaHiddenValue)}></div> <div role="presentation"></div> <div role="none"></div> <div${$.attr('role', dynamicRole)}></div> <div${$.attr('role', dynamicRole)}></div> `);
	$.element($$renderer, Math.random() ? 'button' : 'div');
}