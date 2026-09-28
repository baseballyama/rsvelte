import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { BlockViewerContext } from "./block-viewer.svelte";

var root = $.from_html(`<iframe loading="lazy"></iframe>`);

export default function Block_viewer_iframe($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(
		node,
		(// todo see if we need
		// let iframeHtml = `<iframe title="${ctx.item.name}" src="/view/${ctx.item.name}" height="930" class="bg-background no-scrollbar relative z-20 hidden w-full md:block"></iframe>`
		) => ctx.iframeKey,
		($$anchor) => {
			var iframe = root();

			$.template_effect(
				($0) => {
					$.set_attribute(iframe, 'title', ctx.item.name);
					$.set_attribute(iframe, 'src', `/view/${ctx.item.name ?? ''}`);
					$.set_attribute(iframe, 'height', typeof ctx.item.meta?.iframeHeight === "number" ? ctx.item.meta.iframeHeight : 930);
					$.set_class(iframe, 1, $0);
				},
				[
					() => $.clsx(cn("relative z-20 no-scrollbar w-full bg-background", $$props.class))
				]
			);

			$.append($$anchor, iframe);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}