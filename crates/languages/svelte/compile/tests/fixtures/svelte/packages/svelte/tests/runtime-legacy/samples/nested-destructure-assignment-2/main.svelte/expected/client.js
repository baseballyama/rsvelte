import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get, writable } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <h1>Bag'ol stores</h1> <p> </p> <p> </p> <p> </p> <button>Click me!</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $bagOlStores = () => $.store_get(bagOlStores, '$bagOlStores', $$stores);
	const $secondStore = () => $.store_get(secondStore, '$secondStore', $$stores);
	const $firstStore = () => $.store_get(firstStore, '$firstStore', $$stores);
	const $thirdStore = () => $.store_get(thirdStore, '$thirdStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let bagOlStores = writable([1, 2, 3, writable(4), writable(5), writable(6)]);
	let firstNonStore;
	let secondNonStore;
	let thirdNonStore;
	let firstStore;
	let secondStore;
	let thirdStore;

	[
		firstNonStore,
		secondNonStore,
		thirdNonStore,
		firstStore,
		secondStore,
		thirdStore
	] = $bagOlStores();

	function changeStores() {
		$.store_set(bagOlStores, (($$value) => {
			var $$array_1 = $.to_array($$value, 6);

			firstNonStore = $$array_1[0];
			secondNonStore = $$array_1[1];
			thirdNonStore = $$array_1[2];
			firstStore = $$array_1[3];
			$.store_set(secondStore, $$array_1[4]);
			thirdStore = $$array_1[5];

			return $$value;
		})([
			7,
			8,
			9,
			writable(10),
			11,
			writable(12),
			writable(14),
			writable(15)
		]));
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4, true);
	var p_5 = $.sibling(p_4, 2);
	var text_5 = $.only_child(p_5, true);
	var p_6 = $.sibling(p_5, 4);
	var text_6 = $.only_child(p_6, true);
	var p_7 = $.sibling(p_6, 2);
	var text_7 = $.only_child(p_7, true);
	var p_8 = $.sibling(p_7, 2);
	var text_8 = $.only_child(p_8, true);
	var button = $.sibling(p_8, 2);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, firstNonStore);
			$.set_text(text_1, secondNonStore);
			$.set_text(text_2, thirdNonStore);
			$.set_text(text_3, $firstStore());
			$.set_text(text_4, $secondStore());
			$.set_text(text_5, $thirdStore());
			$.set_text(text_6, $0);
			$.set_text(text_7, $1);
			$.set_text(text_8, $2);
		},
		[
			() => get($bagOlStores()[5]),
			() => get($bagOlStores()[6]),
			() => get($bagOlStores()[7])
		]
	);

	$.event('click', button, changeStores);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}