import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AvatarImageState } from "../avatar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'src',
	'child',
	'id',
	'ref',
	'crossorigin',
	'referrerpolicy'
]);

var root = $.from_html(`<img/>`);

export default function Avatar_image($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		crossorigin = $.prop($$props, 'crossorigin', 3, undefined),
		referrerpolicy = $.prop($$props, 'referrerpolicy', 3, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	const imageState = AvatarImageState.create({
		src: boxWith(() => $$props.src),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		crossOrigin: boxWith(() => crossorigin()),
		referrerPolicy: boxWith(() => referrerpolicy())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, imageState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var img = root();

			$.attribute_effect(img, () => ({ ...$.get(mergedProps), src: $$props.src }));
			$.replay_events(img);
			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}