import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combo } from "@svar-ui/svelte-core";

export default function ComboCell($$anchor, $$props) {
	$.push($$props, true);

	const options = [
		{ id: 1, label: "New Amieshire" },
		{ id: 2, label: "New Gust" },
		{ id: 3, label: "Lefflerstad" },
		{ id: 4, label: "East Catalina" },
		{ id: 5, label: "Ritchieborough" }
	];

	const id = $.derived(() => {
		const option = options.find((i) => i.label === $$props.row[$$props.column.id]);

		return option && option.id ? option.id : 1;
	});

	function onChange(ev) {
		const { value } = ev;

		$$props.onaction && $$props.onaction({
			action: "custom-combo",
			data: {
				value: options.find((i) => i.id === value).label,
				column: $$props.column.id,
				row: $$props.row.id
			}
		});
	}

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;

			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, option().label));
			$.append($$anchor, text);
		};

		Combo($$anchor, {
			get options() {
				return options;
			},

			get value() {
				return $.get(id);
			},
			onchange: onChange,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}