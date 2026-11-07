import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import component from './foo';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function This_attr01_input($$anchor) {
	const style = { color: 'red' };
	let componentValue;
	let metaData = {};

	function handleChange() {}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--style-props': style }));

		$.component(node.lastChild, () => component, ($$anchor, $$component) => {
			$$component($$anchor, {
				get value() {
					return componentValue;
				},

				set value($$value) {
					componentValue = $$value;
				},

				get metaData() {
					return metaData;
				},

				set metaData($$value) {
					metaData = $$value;
				},
				$$events: { changeValue: handleChange }
			});
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}