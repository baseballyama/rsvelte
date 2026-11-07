import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import Inspect, { configured } from '$lib/index.js'
		// console.dir(Inspect.Values)
		let noanimate = false;

		let opts = $.derived(() => ({ noanimate }));

		// const CustomInspect = Inspect.Values.withOptions(() => ({ theme: 'inspect' }))
		// const CustomInspect = configured(() => ({ theme: 'inspect' }))
		// const AnimatedInspect = CustomInspect.withOptions(() => opts)
		// const Configured2 = AnimatedInspect.withOptions(() => ({ showPreview: true }))
		// const Configured3 = Configured2.withOptions(() => ({ borderless: false }))
		// const Configured4 = Configured3.withOptions(() => ({ showTypes: false, theme: 'drak' }))
		let anObject = {};

		// function create() {
		//   console.time('create')
		//   const ret = Inspect.Values.Config.Borderless.Ok
		//   console.timeEnd('create')
		//   return ret
		// }
		let Component = Inspect.Values.withOptions(() => opts());

		$$renderer.push(`<div><label>noanimate <input type="checkbox"${$.attr('checked', noanimate, true)}/></label> <button>add</button></div> `);

		if (Component.Config.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.Ok) {
			$$renderer.push('<!--[-->');
			Component.Config.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.Ok($$renderer, { a: true, b: true, c: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}