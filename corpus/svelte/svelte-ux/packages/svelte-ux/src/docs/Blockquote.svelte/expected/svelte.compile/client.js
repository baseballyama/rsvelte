import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiInformation } from '@mdi/js';
import Icon from '../lib/components/Icon.svelte';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<div><!> <!></div>`);

export default function Blockquote($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Icon(node, {
		get data() {
			return mdiInformation;
		},
		class: 'text-primary'
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cls('bg-primary/10 border border-l-[6px] border-primary/30 border-l-primary text-primary px-4 py-2 my-4 rounded flex items-center gap-2 text-sm', '[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:decoration-primary/50 [&>a]:underline-offset-2'))
	]);

	$.append($$anchor, div);
	$.pop();
}