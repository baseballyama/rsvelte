import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			margin = null,
			color = 'red',
			fontSize = '18px',
			style1 = 'border: 1px solid',
			style2 = 'border: 1px solid; margin: 1em',
			style3 = 'color:blue; border: 1px solid; color: green;',
			style4 = 'background:blue; background: linear-gradient(0, white 0%, red 100%)',
			style5 = 'border: 1px solid; /* width: 100px; height: 100%; color: green */',
			style6 = 'background: url(https://placehold.co/100x100?text=;&font=roboto);',
			style7 = 'background: url("https://placehold.co/100x100?text=;&font=roboto");',
			style8 = "background: url('https://placehold.co/100x100?text=;&font=roboto');",
			browser
		} = $$props;

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

		$$renderer.push(`<main id="main"${$.attr_style('', { color: browser ? 'white' : 'black' })}><div${$.attr_style('', [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style1, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style2, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style3, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style4, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style5, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style6, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style7, [{ margin, color }, { 'font-size': fontSize }])}></div> <div${$.attr_style(style8, [{ margin, color }, { 'font-size': fontSize }])}></div></main>`);
		$.bind_props($$props, { get_and_clear_mutations });
	});
}