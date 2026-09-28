import * as $ from 'svelte/internal/server';
import { calculateZoomLevel } from '@lexical/utils';
import { skipAddingToHistoryStack } from './helpers.js';

export default function MoveWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { className = undefined, style = undefined, onChange, children } = $$props;
		let divRef;
		let draggedRef = false;

		function clamp(value, max, min) {
			return value > max ? max : value < min ? min : value;
		}

		const move = (e) => {
			if (divRef) {
				//const {current: div} = divRef;
				const { width, height, left, top } = divRef.getBoundingClientRect();

				const zoom = calculateZoomLevel(divRef);
				const x = clamp(e.clientX / zoom - left, width, 0);
				const y = clamp(e.clientY / zoom - top, height, 0);

				onChange({ x, y });
			}
		};

		const onMouseDown = (e) => {
			if (e.button !== 0) {
				return;
			}

			move(e);

			const onMouseMove = (_e) => {
				draggedRef = true;
				$.store_set(skipAddingToHistoryStack, true);
				move(_e);
			};

			const onMouseUp = (_e) => {
				if (draggedRef) {
					$.store_set(skipAddingToHistoryStack, false);
				}

				document.removeEventListener('mousemove', onMouseMove, false);
				document.removeEventListener('mouseup', onMouseUp, false);
				move(_e);
				draggedRef = false;
			};

			document.addEventListener('mousemove', onMouseMove, false);
			document.addEventListener('mouseup', onMouseUp, false);
		};

		$$renderer.push(`<div${$.attr_class($.clsx(className), 'svelte-6d2tvl')}${$.attr_style(style)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}