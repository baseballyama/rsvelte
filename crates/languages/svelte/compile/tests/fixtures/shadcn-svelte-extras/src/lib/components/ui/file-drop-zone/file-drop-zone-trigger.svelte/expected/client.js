import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { useFileDropZoneTrigger } from './file-drop-zone.svelte.js';
import { displaySize } from './index.js';
import UploadIcon from '@lucide/svelte/icons/upload';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<span class="text-muted-foreground/75 text-sm"><!> <!> <!></span>`);
var root_2 = $.from_html(`<div class="hover:bg-accent/25 flex h-48 flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-all group-aria-disabled/file-drop-zone-trigger:opacity-50 hover:cursor-pointer group-aria-disabled/file-drop-zone-trigger:hover:cursor-not-allowed"><div class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed"><!></div> <div class="flex flex-col gap-0.5 text-center"><span class="text-muted-foreground font-medium">Drag 'n' drop files here, or click to select files</span> <!></div></div>`);
var root_3 = $.from_html(`<label><!></label>`);

export default function File_drop_zone_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const triggerState = useFileDropZoneTrigger();
	var label = root_3();

	$.attribute_effect(label, ($0) => ({ class: $0, ...triggerState.props, ...rest }), [() => cn('group/file-drop-zone-trigger', $$props.class)]);

	var node = $.child(label);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			UploadIcon(node_2, { class: 'size-7' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.sibling($.child(div_2), 2);

			{
				var consequent_4 = ($$anchor) => {
					var span = root_1();
					var node_4 = $.child(span);

					{
						var consequent_1 = ($$anchor) => {
							var span_1 = root();
							var text = $.only_child(span_1);

							$.template_effect(() => $.set_text(text, `You can upload ${triggerState.rootState.opts.maxFiles.current ?? ''} files`));
							$.append($$anchor, span_1);
						};

						$.if(node_4, ($$render) => {
							if (triggerState.rootState.opts.maxFiles.current) $$render(consequent_1);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_2 = ($$anchor) => {
							var span_2 = root();
							var text_1 = $.only_child(span_2);

							$.template_effect(($0) => $.set_text(text_1, `(up to ${$0 ?? ''} each)`), [
								() => displaySize(triggerState.rootState.opts.maxFileSize.current)
							]);

							$.append($$anchor, span_2);
						};

						$.if(node_5, ($$render) => {
							if (triggerState.rootState.opts.maxFiles.current && triggerState.rootState.opts.maxFileSize.current) $$render(consequent_2);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_3 = ($$anchor) => {
							var span_3 = root();
							var text_2 = $.only_child(span_3);

							$.template_effect(($0) => $.set_text(text_2, `Maximum size ${$0 ?? ''}`), [
								() => displaySize(triggerState.rootState.opts.maxFileSize.current)
							]);

							$.append($$anchor, span_3);
						};

						$.if(node_6, ($$render) => {
							if (triggerState.rootState.opts.maxFileSize.current && !triggerState.rootState.opts.maxFiles.current) $$render(consequent_3);
						});
					}

					$.reset(span);
					$.append($$anchor, span);
				};

				$.if(node_3, ($$render) => {
					if (triggerState.rootState.opts.maxFiles.current || triggerState.rootState.opts.maxFileSize.current) $$render(consequent_4);
				});
			}

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(label);
	$.bind_this(label, ($$value) => ref($$value), () => ref());
	$.append($$anchor, label);
	$.pop();
}