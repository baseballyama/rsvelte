import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Splat, SplatLoader } from '@pmndrs/vanilla';
import { T, useLoader, useTask, useThrelte } from '@threlte/core';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'src',
	'alphaHash',
	'alphaTest',
	'toneMapped',
	'children'
]);

export default function Splat_1($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let alphaHash = $.prop($$props, 'alphaHash', 3, false),
		alphaTest = $.prop($$props, 'alphaTest', 3, undefined),
		toneMapped = $.prop($$props, 'toneMapped', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const { renderer, camera } = useThrelte();
	const loader = useLoader(SplatLoader, { args: [renderer] });
	let framesRendered = 0;
	let running = $.state(false);

	useTask(
		() => {
			framesRendered++;

			// render for 10 frames
			if (framesRendered >= 10) {
				$.set(running, false);
			}
		},
		{ running: () => $.get(running) }
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => loader.load($$props.src), null, ($$anchor, splat) => {
		{
			let $0 = $.derived(() => [
				$.get(splat),
				$camera(),
				{
					alphaHash: alphaHash(),
					alphaTest: alphaTest(),
					toneMapped: toneMapped()
				}
			]);

			T($$anchor, $.spread_props(() => rest, {
				dispose: false,
				get is() {
					return Splat;
				},

				get args() {
					return $.get($0);
				},

				oncreate: () => {
					$.set(running, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: Splat }));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}