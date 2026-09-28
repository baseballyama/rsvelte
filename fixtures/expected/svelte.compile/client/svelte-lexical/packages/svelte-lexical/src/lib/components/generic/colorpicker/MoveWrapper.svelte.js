import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calculateZoomLevel } from '@lexical/utils';
import { skipAddingToHistoryStack } from './helpers.js';

var root = $.from_html(`<div><!></div>`);

export default function MoveWrapper($$anchor, $$props) {
	$.push($$props, true);

	const $skipAddingToHistoryStack = () => $.store_get(skipAddingToHistoryStack, '$skipAddingToHistoryStack', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let className = $.prop($$props, 'className', 3, undefined),
		style = $.prop($$props, 'style', 3, undefined);

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

			$$props.onChange({ x, y });
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

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => divRef = $$value, () => divRef);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx(className()), 'svelte-6d2tvl');
		$.set_style(div, style());
	});

	$.delegated('mousedown', div, onMouseDown);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['mousedown']);