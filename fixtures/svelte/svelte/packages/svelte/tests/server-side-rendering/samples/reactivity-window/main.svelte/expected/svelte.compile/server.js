import * as $ from 'svelte/internal/server';

import {
	devicePixelRatio,
	innerHeight,
	innerWidth,
	online,
	outerHeight,
	outerWidth,
	screenLeft,
	screenTop,
	scrollX,
	scrollY
} from "svelte/reactivity/window";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>devicePixelRatio: ${$.escape(devicePixelRatio.current)}</p> <p>innerHeight: ${$.escape(innerHeight.current)}</p> <p>innerWidth: ${$.escape(innerWidth.current)}</p> <p>online: ${$.escape(online.current)}</p> <p>outerHeight: ${$.escape(outerHeight.current)}</p> <p>outerWidth: ${$.escape(outerWidth.current)}</p> <p>screenLeft: ${$.escape(screenLeft.current)}</p> <p>screenTop: ${$.escape(screenTop.current)}</p> <p>scrollX: ${$.escape(scrollX.current)}</p> <p>scrollY: ${$.escape(scrollY.current)}</p>`);
	});
}