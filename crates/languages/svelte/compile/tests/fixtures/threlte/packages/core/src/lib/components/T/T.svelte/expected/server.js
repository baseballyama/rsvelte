import * as $ from 'svelte/internal/server';
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

export default function T($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			is = useIs(),
			args,
			attach,
			dispose,
			ref = void 0,
			oncreate,
			children,
			makeDefault,
			manual,
			$$slots,
			$$events,
			...props
		} = $$props;

		/**
		 * When "is" or "args" change, we need to create a new ref.
		 */
		const internalRef = $.derived(() => determineRef(is, args));

		// Plugins are initialized here so that pluginsProps
		// is available in the props update
		const plugins = usePlugins({
			get ref() {
				return internalRef();
			},

			get args() {
				return args;
			},

			get attach() {
				return attach;
			},

			get manual() {
				return manual;
			},

			get makeDefault() {
				return makeDefault;
			},

			get dispose() {
				return dispose;
			},

			get props() {
				return props;
			}
		});

		// Props
		useProps(() => internalRef(), () => props, () => plugins?.pluginsProps);

		// Attachment
		useAttach(() => internalRef(), () => attach);

		// Disposal
		useDispose(() => internalRef(), () => dispose);

		createParentObject3DContext(() => isInstanceOf(internalRef(), 'Object3D') ? internalRef() : undefined);
		createParentContext(() => internalRef());

		if (/**
		 * oncreate needs to be called after all other hooks
		 * so that props will have been set once ref is passed
		 * to this callback
		 */
		isInstanceOf(internalRef(), 'PerspectiveCamera') || isInstanceOf(internalRef(), 'OrthographicCamera')) {
			$$renderer.push('<!--[0-->');
			Camera($$renderer, $.spread_props([{ ref: internalRef(), manual, makeDefault }, props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer, { ref: internalRef() });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref });
	});
}