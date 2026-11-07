import * as $ from 'svelte/internal/server';

export default function Builtin_types_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.date.getTime(), props.regexp.test('test'), props.promise.then(console.log), props.map.get('key'), props.set.has('value'));
	});
}