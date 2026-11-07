import * as $ from 'svelte/internal/server';

const data = { list: [], derived: 0 };
const derived = $.derived(() => data.list.filter(() => true));

const state = {
	data,
	get derived() {
		return derived();
	}
};

export default function Main($$renderer) {
	var $$store_subs;

	data.list.length = 0;
	;;
	$$renderer.push(`<button>update</button> ${$.escape(state.data.list)}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}