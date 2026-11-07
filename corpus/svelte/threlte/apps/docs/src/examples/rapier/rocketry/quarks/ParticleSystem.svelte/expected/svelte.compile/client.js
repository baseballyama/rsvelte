import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, useParent } from '@threlte/core';
import { ParticleSystem } from 'three.quarks';
import { useBatchedRenderer } from './useBatchedRenderer';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'children',
	'system'
]);

export default function ParticleSystem_1($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let system = $.prop($$props, 'system', 15),
		rest = $.rest_props($$props, rest_excludes);

	const { renderer } = useBatchedRenderer();

	system(new ParticleSystem({ ...rest }));

	const parent = useParent();

	$.user_effect(() => {
		if (isInstanceOf($parent(), 'Object3D')) {
			$parent().add(system().emitter);
		}

		return () => {
			if (isInstanceOf($parent(), 'Object3D')) {
				$parent().remove(system().emitter);
			}
		};
	});

	$.user_effect(() => {
		if (!$$props.name) return;

		system(system().emitter.name = $$props.name, true);
	});

	$.user_effect(() => {
		renderer.addSystem(system());

		return () => {
			renderer.deleteSystem(system());
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ system: system() }));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}