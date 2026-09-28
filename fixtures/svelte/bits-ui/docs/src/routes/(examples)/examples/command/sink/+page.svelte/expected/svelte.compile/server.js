import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// prettier-ignore
		const ten_first_names = [
			"John",
			"Doe",
			"Jane",
			"Smith",
			"Michael",
			"Brown",
			"William",
			"Johnson",
			"David",
			"Williams"
		];

		// prettier-ignore
		const ten_middle_names = [
			"James",
			"Lee",
			"Robert",
			"Michael",
			"David",
			"Joseph",
			"Thomas",
			"Charles",
			"Christopher",
			"Daniel"
		];

		// prettier-ignore
		const ten_last_names = [
			"Smith",
			"Johnson",
			"Williams",
			"Brown",
			"Jones",
			"Garcia",
			"Miller",
			"Davis",
			"Rodriguez",
			"Martinez"
		];

		// prettier-ignore
		const ten_second_first_names = [
			"Emma",
			"Liam",
			"Sophia",
			"Noah",
			"Olivia",
			"Ethan",
			"Ava",
			"Mason",
			"Isabella",
			"William"
		];

		const names = ten_first_names.map((first) => {
			return ten_middle_names.map((middle) => {
				return ten_last_names.map((last) => {
					return ten_second_first_names.map((second) => {
						return `${first} ${second} ${middle} ${last}`;
					});
				});
			});
		}).flat(3).slice(0, 2500);

		$$renderer.push(`<div>Total items: ${$.escape(names.length)}</div> <div${$.attr_style('', { padding: '16px' })}>`);

		if (Command.Root) {
			$$renderer.push('<!--[-->');

			Command.Root($$renderer, {
				loop: true,
				children: ($$renderer) => {
					if (Command.Input) {
						$$renderer.push('<!--[-->');
						Command.Input($$renderer, { placeholder: 'Search items...' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Command.List) {
						$$renderer.push('<!--[-->');

						Command.List($$renderer, {
							class: 'h-[var(--cmdk-list-height)]',
							style: 'height: 200px; overflow-y: auto; max-width: 300px;',
							children: ($$renderer) => {
								if (Command.Empty) {
									$$renderer.push('<!--[-->');

									Command.Empty($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->No item found.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(names);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let txt = each_array[$$index];

									if (Command.Item) {
										$$renderer.push('<!--[-->');

										Command.Item($$renderer, {
											value: txt,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(txt)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}