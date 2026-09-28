import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { classname = 'custom', foo = true, bar = true, browser } = $$props;
		let mutations = [];
		let observer;

		if (browser) {
			observer = new MutationObserver(update_mutation_records);
			observer.observe(document.querySelector('#main'), { attributes: true, subtree: true });
		}

		function update_mutation_records(results) {
			for (const r of results) {
				mutations.push(r.target.nodeName);
			}
		}

		function get_and_clear_mutations() {
			update_mutation_records(observer.takeRecords());

			const result = mutations;

			mutations = [];

			return result;
		}

		$$renderer.push(`<main id="main"${$.attr_class('', void 0, { 'browser': browser })}><div${$.attr_class($.clsx(classname), 'svelte-1ajf1u2', { 'foo': foo, 'bar': bar })} title="a title"></div> <span${$.attr_class('svelte-1ajf1u2', void 0, { 'foo': foo, 'bar': bar })}></span> <b${$.attr_class($.clsx(classname), void 0, { 'foo': foo, 'bar': bar })}></b> <i${$.attr_class('', void 0, { 'foo': foo, 'bar': bar })}></i> <div${$.attributes({ ...{ class: classname, title: "a title" } }, 'svelte-1ajf1u2', { foo, bar })}></div> <span${$.attributes({ ...{} }, 'svelte-1ajf1u2', { foo, bar })}></span> <b${$.attributes({ ...{ class: classname } }, void 0, { foo, bar })}></b> <i${$.attributes({ ...{} }, void 0, { foo, bar })}></i></main>`);
		$.bind_props($$props, { get_and_clear_mutations });
	});
}