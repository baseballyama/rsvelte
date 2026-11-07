import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { useFileDropZoneDragOverlay } from './file-drop-zone.svelte.js';
import UploadIcon from '@lucide/svelte/icons/upload';
import { Portal } from 'bits-ui';
import { box, mergeProps } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'disabled',
	'portalProps',
	'children'
]);

var root = $.from_html(`<div class="text-foreground flex flex-col place-items-center justify-center gap-3"><!> <span class="text-lg font-medium">Drop files here to upload</span></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function File_drop_zone_drag_overlay($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const dragOverlayState = useFileDropZoneDragOverlay({ disabled: box.with(() => disabled()) });
	const mergedProps = $.derived(() => mergeProps(dragOverlayState.props, rest));
	var fragment = $.comment();

	$.event('dragenter', $.window, function (...$$args) {
		dragOverlayState.windowProps.ondragenter?.apply(this, $$args);
	});

	$.event('dragleave', $.window, function (...$$args) {
		dragOverlayState.windowProps.ondragleave?.apply(this, $$args);
	});

	$.event('dragover', $.window, function (...$$args) {
		dragOverlayState.windowProps.ondragover?.apply(this, $$args);
	});

	$.event('dragend', $.window, function (...$$args) {
		dragOverlayState.windowProps.ondragend?.apply(this, $$args);
	});

	$.event('drop', $.window, function (...$$args) {
		dragOverlayState.windowProps.ondrop?.apply(this, $$args);
	});

	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			Portal($$anchor, $.spread_props(() => $$props.portalProps, {
				children: ($$anchor, $$slotProps) => {
					var div = root_1();

					$.attribute_effect(div, ($0) => ({ class: $0, ...$.get(mergedProps) }), [
						() => cn('animate-in fade-in-0 fixed inset-0 z-50 flex place-items-center justify-center bg-black/25 p-6 duration-100 supports-backdrop-filter:backdrop-blur-xs', $$props.class)
					]);

					var node_1 = $.child(div);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.snippet(node_2, () => $$props.children);
							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var div_1 = root();
							var node_3 = $.child(div_1);

							UploadIcon(node_3, { class: 'size-8' });
							$.next(2);
							$.reset(div_1);
							$.append($$anchor, div_1);
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(div);
					$.bind_this(div, ($$value) => ref($$value), () => ref());
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node, ($$render) => {
			if (dragOverlayState.dragging) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}