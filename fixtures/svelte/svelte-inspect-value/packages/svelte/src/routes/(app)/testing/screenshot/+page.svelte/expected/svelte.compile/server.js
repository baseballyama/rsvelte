import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let noanimate = false;
		let opts = $.derived(() => ({ noanimate }));

		// reactive config
		const ConfiguredInspect = Inspect.Values.withOptions(() => opts());

		// inherit config from ConfiguredInspect (still reactive!)
		const DarkInspect = ConfiguredInspect.withOptions(() => ({ theme: 'dark' }));

		let anything = true;

		if (Inspect.Values) {
			$$renderer.push('<!--[-->');
			Inspect.Values($$renderer, $.spread_props([{ anything, something: [1, 2, 3] }, ['a', 'b', 'c']]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Inspect.Values.Config.StereoTheme.Borderless.NoAnimate.Ok) {
			$$renderer.push('<!--[-->');
			Inspect.Values.Config.StereoTheme.Borderless.NoAnimate.Ok($$renderer, { msg: 'quick config!' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (ConfiguredInspect.Expand10) {
			$$renderer.push('<!--[-->');
			ConfiguredInspect.Expand10($$renderer, { we: true, are: true, boolean: true, props: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		DarkInspect($$renderer, { msg: 'i will have dark theme and whatever options i inherit' });
		$$renderer.push(`<!---->`);
	});
}