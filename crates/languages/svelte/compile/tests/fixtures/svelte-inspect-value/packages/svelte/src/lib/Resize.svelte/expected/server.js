import * as $ from 'svelte/internal/server';

export default function Resize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ele,
			handles,
			enabled = true,
			resizing = false,
			width = void 0,
			height = void 0,
			onResize
		} = $$props;

		let initialRect = null;
		let initialPos = null;
		let activeDir = void 0;

		function onmousedown(event, handle) {
			activeDir = handle;
			resizing = true;
			initialPos = { x: event.pageX, y: event.pageY };
			initialRect = ele.getBoundingClientRect();
		}

		function onmousemove(event) {
			if (!activeDir) return;
			if (!initialPos) return;
			if (!initialRect) return;

			const direction = activeDir;
			let delta;

			if (direction === 'right') {
				delta = event.pageX - initialPos.x;
				width = initialRect.width + delta;
			} else if (direction === 'left') {
				delta = initialPos.x - event.pageX;
				width = initialRect.width + delta;
			} else if (direction === 'top') {
				delta = initialPos.y - event.pageY;
				height = initialRect.height + delta;
			} else if (direction === 'bottom') {
				delta = event.pageY - initialPos.y;
				height = initialRect.height + delta;
			}
		}

		function onmouseup(_event) {
			if (!activeDir) return;

			const dimension = ['left', 'right'].includes(activeDir) ? 'width' : 'height';

			activeDir = undefined;
			resizing = false;
			initialPos = null;
			initialRect = null;
			onResize(dimension);
		}

		function ongrabberdblclick(_e, handle) {
			const dimension = ['left', 'right'].includes(handle) ? 'width' : 'height';

			if (['left', 'right'].includes(handle)) {
				width = undefined;
			} else {
				height = undefined;
			}

			onResize(dimension);
		}

		if (enabled) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(handles);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let handle = each_array[$$index];

				$$renderer.push(`<button${$.attr_class(`grabber ${$.stringify(handle)}`, 'svelte-o42wj9', { 'selected': handle === activeDir })}${$.attr('tabindex', -1)}></button>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { resizing, width, height });
	});
}