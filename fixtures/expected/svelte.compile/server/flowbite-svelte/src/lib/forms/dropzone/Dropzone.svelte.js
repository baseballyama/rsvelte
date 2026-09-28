import * as $ from 'svelte/internal/server';
import { dropzone } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Dropzone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			files = void 0,
			class: className,
			onDrop,
			onDragOver,
			onChange,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("dropzone"));
		let inputElement;

		const handleDrop = function (event) {
			event.preventDefault();

			if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
				files = event.dataTransfer.files;

				if (inputElement) {
					inputElement.files = event.dataTransfer.files;
				}
			}

			if (onDrop) {
				onDrop.call(this, event);
			}
		};

		const handleDragOver = function (event) {
			event.preventDefault();

			if (onDragOver) {
				onDragOver.call(this, event);
			}
		};

		const handleChange = function (event) {
			if (onChange) {
				onChange.call(this, event);
			}
		};

		$$renderer.push(`<label${$.attr_class($.clsx(dropzone({ class: clsx(theme(), className) })))}>`);
		children($$renderer);
		$$renderer.push(`<!----> <input${$.attributes({ ...restProps, type: 'file', class: 'hidden' }, void 0, void 0, void 0, 4)}/></label>`);
		$.bind_props($$props, { files });
	});
}