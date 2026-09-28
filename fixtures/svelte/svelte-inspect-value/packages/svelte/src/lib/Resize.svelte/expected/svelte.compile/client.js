import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Resize($$anchor, $$props) {
	$.push($$props, true);

	let enabled = $.prop($$props, 'enabled', 3, true),
		resizing = $.prop($$props, 'resizing', 15, false),
		width = $.prop($$props, 'width', 15),
		height = $.prop($$props, 'height', 15);

	let initialRect = null;
	let initialPos = null;
	let activeDir = $.state(void 0);

	function onmousedown(event, handle) {
		$.set(activeDir, handle, true);
		resizing(true);
		initialPos = { x: event.pageX, y: event.pageY };
		initialRect = $$props.ele.getBoundingClientRect();
	}

	function onmousemove(event) {
		if (!$.get(activeDir)) return;
		if (!initialPos) return;
		if (!initialRect) return;

		const direction = $.get(activeDir);
		let delta;

		if (direction === 'right') {
			delta = event.pageX - initialPos.x;
			width(initialRect.width + delta);
		} else if (direction === 'left') {
			delta = initialPos.x - event.pageX;
			width(initialRect.width + delta);
		} else if (direction === 'top') {
			delta = initialPos.y - event.pageY;
			height(initialRect.height + delta);
		} else if (direction === 'bottom') {
			delta = event.pageY - initialPos.y;
			height(initialRect.height + delta);
		}
	}

	function onmouseup(_event) {
		if (!$.get(activeDir)) return;

		const dimension = ['left', 'right'].includes($.get(activeDir)) ? 'width' : 'height';

		$.set(activeDir, undefined);
		resizing(false);
		initialPos = null;
		initialRect = null;
		$$props.onResize(dimension);
	}

	function ongrabberdblclick(_e, handle) {
		const dimension = ['left', 'right'].includes(handle) ? 'width' : 'height';

		if (['left', 'right'].includes(handle)) {
			width(undefined);
		} else {
			height(undefined);
		}

		$$props.onResize(dimension);
	}

	var fragment = $.comment();

	$.event('mouseup', $.window, onmouseup);
	$.event('mousemove', $.window, onmousemove);

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => $$props.handles, (handle) => handle, ($$anchor, handle) => {
				var button = root();
				let classes;

				$.set_attribute(button, 'tabindex', -1);
				$.template_effect(() => classes = $.set_class(button, 1, `grabber ${handle ?? ''}`, 'svelte-o42wj9', classes, { selected: handle === $.get(activeDir) }));
				$.delegated('mousedown', button, (e) => onmousedown(e, handle));
				$.delegated('dblclick', button, (e) => ongrabberdblclick(e, handle));
				$.append($$anchor, button);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (enabled()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mousedown', 'dblclick']);