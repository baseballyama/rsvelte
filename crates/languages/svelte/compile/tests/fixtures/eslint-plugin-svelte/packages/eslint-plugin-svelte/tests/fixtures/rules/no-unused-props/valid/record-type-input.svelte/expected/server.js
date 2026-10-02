import * as $ from 'svelte/internal/server';

export default function Record_type_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const value = props.metadata['key'];
		const enabled = props.settings['feature'];
	});
}