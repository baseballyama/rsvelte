import * as $ from 'svelte/internal/server';
import { useFileDropZone } from './file-drop-zone.svelte.js';
import { box } from 'svelte-toolbelt';

export default function File_drop_zone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = uid,
			maxFiles,
			maxFileSize,
			fileCount,
			disabled = false,
			onUpload,
			onFileRejected,
			accept,
			capturePaste = false,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const rootState = useFileDropZone({
			id: box.with(() => id),
			disabled: box.with(() => disabled ?? false),
			onUpload: box.with(() => onUpload),
			maxFiles: box.with(() => maxFiles),
			fileCount: box.with(() => fileCount),
			maxFileSize: box.with(() => maxFileSize),
			onFileRejected: box.with(() => onFileRejected),
			accept: box.with(() => accept)
		});

		$$renderer.push(`<input${$.attributes({ class: 'hidden', ...rootState.props, ...rest }, void 0, void 0, void 0, 4)}/> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}