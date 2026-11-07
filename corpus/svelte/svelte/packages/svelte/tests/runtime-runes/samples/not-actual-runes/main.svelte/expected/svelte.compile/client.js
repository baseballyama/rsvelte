import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { state, effect } from './store.js';

var root = $.from_html(`<p> </p> <button>Shouldnt be reactive</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $state = () => $.store_get(state, '$state', $$stores);
	const $effect = () => $.store_get(effect, '$effect', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let foo = $state()(0); // foo = 1

	$effect()(() => {
		throw new Error('Shouldnt be called');
	});

	function bar($derived, $effect) {
		const x = $derived(foo + 1); // x = 3

		$effect(() => {
			throw new Error('Shouldnt be called');
		});

		return {
			get x() {
				return x + $derived(0); /* == 4 */
			},

			get y() {
				return $effect(() => {
					throw new Error('Shouldnt be called');
				}); /* == 0 */
			}
		};
	}

	const baz = bar($state(), $effect());
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, `${foo ?? ''} ${baz.x ?? ''} ${baz.y ?? ''}`));
	$.event('click', button, () => foo = 5);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}