import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';

var root = $.from_html(`<div><label>noanimate <input type="checkbox"/></label> <button>add</button></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// import Inspect, { configured } from '$lib/index.js'
	// console.dir(Inspect.Values)
	let noanimate = $.state(false);

	let opts = $.derived(() => ({ noanimate: $.get(noanimate) }));

	// const CustomInspect = Inspect.Values.withOptions(() => ({ theme: 'inspect' }))
	// const CustomInspect = configured(() => ({ theme: 'inspect' }))
	// const AnimatedInspect = CustomInspect.withOptions(() => opts)
	// const Configured2 = AnimatedInspect.withOptions(() => ({ showPreview: true }))
	// const Configured3 = Configured2.withOptions(() => ({ borderless: false }))
	// const Configured4 = Configured3.withOptions(() => ({ showTypes: false, theme: 'drak' }))
	let anObject = $.proxy({});

	// function create() {
	//   console.time('create')
	//   const ret = Inspect.Values.Config.Borderless.Ok
	//   console.timeEnd('create')
	//   return ret
	// }
	let Component = Inspect.Values.withOptions(() => $.get(opts));

	var fragment = root();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var button = $.sibling(label, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	$.component(node, () => Component.Config.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.Ok, (
		$$anchor,
		Component_Config_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_Ok
	) => {
		Component_Config_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_NoTools_Ok($$anchor, { a: true, b: true, c: true });
	});

	$.bind_checked(input, () => $.get(noanimate), ($$value) => $.set(noanimate, $$value));
	$.delegated('click', button, () => anObject['a'] = 'a');
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);