import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AvatarRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<img/>`);

export default function Image($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const avatar = AvatarRootContext.consume();

	const element = $.derived(() => $$props.element),
		rest = $.derived(() => $.exclude_from_object(props, ['element']));

	const attributes = $.derived(() => mergeProps(avatar().getImageProps(), $.get(rest)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var img = root();

			$.attribute_effect(img, () => ({ ...$.get(attributes) }));
			$.replay_events(img);
			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}