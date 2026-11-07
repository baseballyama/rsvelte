import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Metadata from "$lib/components/metadata.svelte";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `/og?title=${encodeURIComponent($$props.data.meta.name)}&description=${encodeURIComponent($$props.data.meta.description)}`
		}));

		Metadata(node, {
			get title() {
				return $$props.data.meta.name;
			},

			get description() {
				return $$props.data.meta.description;
			},

			get ogImage() {
				return $.get($0);
			},
			ogType: 'article'
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	$.component(node_1, () => $$props.data.component, ($$anchor, data_component) => {
		data_component($$anchor, {});
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("bg-background", $$props.data.meta?.className))
	]);

	$.append($$anchor, fragment);
	$.pop();
}