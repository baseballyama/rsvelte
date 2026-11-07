import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { RichSelect } from "@svar-ui/svelte-core";
import { getValue } from "@svar-ui/grid-store";

var root = $.from_html(`<div style="width:100%;"><!></div>`);

export default function Richselect($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const api = getContext("grid-store");
	const { flatData: data } = api.getReactiveState();
	let options = $.derived(() => $$props.filter?.config?.options || $$props.column.options || getOptions($data()));
	let template = $.derived(() => $$props.filter?.config?.template);

	function getOptions() {
		const options = [];

		$data().forEach((d) => {
			const value = getValue(d, $$props.column);

			if (!options.includes(value)) options.push(value);
		});

		return options.map((opt) => ({ id: opt, label: opt }));
	}

	function filterRows({ value }) {
		$$props.action({ value, key: $$props.column.id });
	}

	function handleKeyDown(ev) {
		if (ev.key !== "Tab") ev.preventDefault();
	}

	var div = root();
	var node = $.child(div);

	{
		const children = ($$anchor, option = $.noop) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => $.get(template)(option())]);
					$.append($$anchor, text);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, option().label));
					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(template)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		RichSelect(node, $.spread_props({ placeholder: "", clear: true }, () => $$props.filter.config ?? {}, {
			get options() {
				return $.get(options);
			},

			get value() {
				return $$props.filterValue;
			},
			onchange: filterRows,
			children,
			$$slots: { default: true }
		}));
	}

	$.reset(div);
	$.delegated('keydown', div, handleKeyDown);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['keydown']);