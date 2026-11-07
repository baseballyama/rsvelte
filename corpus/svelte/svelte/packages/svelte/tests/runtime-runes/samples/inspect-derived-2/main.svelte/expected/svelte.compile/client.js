import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const data = $.proxy({ list: [], derived: 0 });
const derived = $.derived(() => data.list.filter(() => true));

const state = {
	data,
	get derived() {
		return $.get(derived);
	}
};

var root = $.from_html(`<button>update</button> `, 1);

export default function Main($$anchor) {
	const $state = () => $.store_get(state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	data.list.length = 0;
	;;

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${state.data.list ?? ''}`));
	$.delegated('click', button, () => state.data.list.push(1));
	$.append($$anchor, fragment);
	$$cleanup();
}

$.delegate(['click']);