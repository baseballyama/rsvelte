import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Builtin_types_input($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	console.log($$props.date.getTime(), $$props.regexp.test('test'), $$props.promise.then(console.log), $$props.map.get('key'), $$props.set.has('value'));
	$.pop();
}