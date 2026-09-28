import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useAttach } from './utils/useAttach.svelte.js';
import { useDispose } from './utils/useDispose.svelte.js';
import { useIs } from './utils/useIs.js';
import { usePlugins } from './utils/usePlugins.js';
import { useProps } from './utils/useProps.svelte.js';
import { determineRef } from './utils/utils.js';
import { isInstanceOf } from '../../utilities/isInstanceOf.js';
import { untrack } from 'svelte';
import { createParentObject3DContext } from '../../context/fragments/parentObject3D.js';
import { createParentContext } from '../../context/fragments/parent.js';
import Camera from './Camera.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'is',
	'args',
	'attach',
	'dispose',
	'ref',
	'oncreate',
	'children',
	'makeDefault',
	'manual'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function T($$anchor, $$props) {
	$.push($$props, true);

	let is = $.prop($$props, 'is', 19, useIs),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	/**
	 * When "is" or "args" change, we need to create a new ref.
	 */
	const internalRef = $.derived(() => determineRef(is(), $$props.args));

	// Plugins are initialized here so that pluginsProps
	// is available in the props update
	const plugins = usePlugins({
		get ref() {
			return $.get(internalRef);
		},

		get args() {
			return $$props.args;
		},

		get attach() {
			return $$props.attach;
		},

		get manual() {
			return $$props.manual;
		},

		get makeDefault() {
			return $$props.makeDefault;
		},

		get dispose() {
			return $$props.dispose;
		},

		get props() {
			return props;
		}
	});

	// Props
	useProps(() => $.get(internalRef), () => props, () => plugins?.pluginsProps);

	// Attachment
	useAttach(() => $.get(internalRef), () => $$props.attach);

	// Disposal
	useDispose(() => $.get(internalRef), () => $$props.dispose);

	createParentObject3DContext(() => isInstanceOf($.get(internalRef), 'Object3D') ? $.get(internalRef) : undefined);
	createParentContext(() => $.get(internalRef));

	/**
	 * oncreate needs to be called after all other hooks
	 * so that props will have been set once ref is passed
	 * to this callback
	 */
	$.user_effect(() => {
		if ($.get(internalRef)) {
			return untrack(() => {
				if (ref() !== $.get(internalRef)) {
					ref($.get(internalRef));
				}

				return $$props.oncreate?.($.get(internalRef));
			});
		}
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Camera($$anchor, $.spread_props(
				{
					get ref() {
						return $.get(internalRef);
					},

					get manual() {
						return $$props.manual;
					},

					get makeDefault() {
						return $$props.makeDefault;
					}
				},
				() => props
			));
		};

		var d = $.derived(() => isInstanceOf($.get(internalRef), 'PerspectiveCamera') || isInstanceOf($.get(internalRef), 'OrthographicCamera'));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: $.get(internalRef) }));
	$.append($$anchor, fragment);
	$.pop();
}