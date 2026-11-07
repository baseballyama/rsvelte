import * as $ from 'svelte/internal/server';

export default function Nested_props_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.user.name, props.user.profile.age, props.user.profile.bio);
	});
}