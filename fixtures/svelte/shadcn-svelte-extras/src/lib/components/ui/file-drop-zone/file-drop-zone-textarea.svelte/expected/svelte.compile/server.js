import * as $ from 'svelte/internal/server';
import { useFileDropZoneTextarea } from './file-drop-zone.svelte.js';
import { box, mergeProps } from 'svelte-toolbelt';

export default function File_drop_zone_textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			onpaste,
			ondragover,
			ondrop,
			child,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const fileDropZoneTextareaState = useFileDropZoneTextarea({
			onpaste: box.with(() => onpaste),
			ondragover: box.with(() => ondragover),
			ondrop: box.with(() => ondrop)
		});

		const mergedProps = $.derived(() => mergeProps(fileDropZoneTextareaState.props, rest));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><textarea${$.attributes({ ...mergedProps() })}></textarea>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}