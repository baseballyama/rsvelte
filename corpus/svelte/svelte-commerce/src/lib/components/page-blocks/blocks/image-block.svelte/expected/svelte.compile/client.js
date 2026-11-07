import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><img class="h-full w-full object-contain" alt=""/></button>`);

export default function Image_block($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(() => $$props.block.metadata.aspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	var button = root();
	var img = $.only_child(button);

	$.template_effect(() => {
		$.set_style(button, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${$$props.block.metadata.maxWidth
			? `max-width: ${$$props.block.metadata.maxWidth}px;`
			: ``}`);

		$.set_class(button, 1, `${$$props.block.metadata.redirectOnClick ? 'cursor-pointer' : 'cursor-default'} ${$$props.block.metadata?.horizontalAlign === 'stretch' ? 'w-full' : ''} flex items-center justify-center`);
		$.set_attribute(img, 'src', $$props.block.metadata.url);
	});

	$.delegated('click', button, () => {
		if ($$props.block.metadata.redirectOnClick) window.location.href = $$props.block.metadata.redirectTo;
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);