import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useParentObject3D, useThrelte } from '@threlte/core';
import { Group } from 'three';
import { createSuspenseContext } from './context.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Suspense($$anchor, $$props) {
	$.push($$props, true);

	const $suspended = () => $.store_get(suspended, '$suspended', $$stores);
	const $errors = () => $.store_get(errors, '$errors', $$stores);
	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let final = $.prop($$props, 'final', 3, false);
	const { suspended, errors, setFinal } = createSuspenseContext({ final: final() });

	$.user_effect(() => setFinal(final()));

	$.user_effect(() => {
		if (!$suspended()) $$props.onload?.();
	});

	$.user_effect(() => {
		if ($suspended()) $$props.onsuspend?.();
	});

	$.user_effect(() => {
		if ($errors().length > 0) $$props.onerror?.($errors());
	});

	const { invalidate } = useThrelte();
	const group = new Group();
	const parent = useParentObject3D();

	$.user_pre_effect(() => {
		// we don't have a parent, so we can't add ourselves to it
		if (!$parent()) return;

		// if the component is suspended or has errors, we remove ourselves from the parent
		if ($suspended() || $errors().length) {
			$parent().remove(group);
			invalidate();

			return;
		}

		$parent().add(group);
		invalidate();

		return () => {
			$parent().remove(group);
			invalidate();
		};
	});

	var fragment = root();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return group;
		},
		attach: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ suspended: $suspended(), errors: $errors() }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.error ?? $.noop, () => ({ errors: $errors() }));
			$.append($$anchor, fragment_2);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			$.snippet(node_4, () => $$props.fallback ?? $.noop);
			$.append($$anchor, fragment_3);
		};

		$.if(node_2, ($$render) => {
			if ($errors().length) $$render(consequent); else if ($suspended()) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}