import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let noanimate = false;
	let opts = $.derived(() => ({ noanimate }));

	// reactive config
	const ConfiguredInspect = Inspect.Values.withOptions(() => $.get(opts));

	// inherit config from ConfiguredInspect (still reactive!)
	const DarkInspect = ConfiguredInspect.withOptions(() => ({ theme: 'dark' }));

	let anything = true;
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => Inspect.Values, ($$anchor, Inspect_Values) => {
		Inspect_Values($$anchor, $.spread_props({ anything, something: [1, 2, 3] }, ['a', 'b', 'c']));
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Inspect.Values.Config.StereoTheme.Borderless.NoAnimate.Ok, (
		$$anchor,
		Inspect_Values_Config_StereoTheme_Borderless_NoAnimate_Ok
	) => {
		Inspect_Values_Config_StereoTheme_Borderless_NoAnimate_Ok($$anchor, { msg: 'quick config!' });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => ConfiguredInspect.Expand10, ($$anchor, ConfiguredInspect_Expand10) => {
		ConfiguredInspect_Expand10($$anchor, { we: true, are: true, boolean: true, props: true });
	});

	var node_3 = $.sibling(node_2, 2);

	DarkInspect(node_3, { msg: 'i will have dark theme and whatever options i inherit' });
	$.append($$anchor, fragment);
	$.pop();
}