import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><div class="bg-background overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground mt-4 text-center text-sm">Dense table</p></div>`);

export default function Table_06($$anchor) {
	const programmingLanguages = [
		{
			developer: 'Brendan Eich',
			extension: '.js',
			id: '1',
			latestVersion: 'ES2021',
			name: 'JavaScript',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1995',
			typing: 'Dynamic'
		},

		{
			developer: 'Guido van Rossum',
			extension: '.py',
			id: '2',
			latestVersion: '3.10',
			name: 'Python',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1991',
			typing: 'Dynamic'
		},

		{
			developer: 'James Gosling',
			extension: '.java',
			id: '3',
			latestVersion: '17',
			name: 'Java',
			paradigm: 'Object-oriented',
			popularity: 'High',
			releaseYear: '1995',
			typing: 'Static'
		},

		{
			developer: 'Bjarne Stroustrup',
			extension: '.cpp',
			id: '4',
			latestVersion: 'C++20',
			name: 'C++',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1985',
			typing: 'Static'
		},

		{
			developer: 'Yukihiro Matsumoto',
			extension: '.rb',
			id: '5',
			latestVersion: '3.0',
			name: 'Ruby',
			paradigm: 'Multi-paradigm',
			popularity: 'Low',
			releaseYear: '1995',
			typing: 'Dynamic'
		}
	];

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Table(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			TableHeader(node_1, {
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: 'bg-muted/50',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							TableHead(node_2, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							TableHead(node_3, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Release Year');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							TableHead(node_4, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Developer');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							TableHead(node_5, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Typing');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							TableHead(node_6, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Paradigm');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							TableHead(node_7, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Extension');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							TableHead(node_8, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Latest Version');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							TableHead(node_9, {
								class: 'h-9 py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Popularity');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_1, 2);

			TableBody(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_11 = $.first_child(fragment_3);

					$.each(node_11, 17, () => programmingLanguages, (language) => language.id, ($$anchor, language) => {
						TableRow($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_12 = $.first_child(fragment_5);

								TableCell(node_12, {
									class: 'py-2 font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(language).name));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								TableCell(node_13, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(language).releaseYear));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_14 = $.sibling(node_13, 2);

								TableCell(node_14, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(() => $.set_text(text_10, $.get(language).developer));
										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_14, 2);

								TableCell(node_15, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, $.get(language).typing));
										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_16 = $.sibling(node_15, 2);

								TableCell(node_16, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text();

										$.template_effect(() => $.set_text(text_12, $.get(language).paradigm));
										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								var node_17 = $.sibling(node_16, 2);

								TableCell(node_17, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text();

										$.template_effect(() => $.set_text(text_13, $.get(language).extension));
										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});

								var node_18 = $.sibling(node_17, 2);

								TableCell(node_18, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text();

										$.template_effect(() => $.set_text(text_14, $.get(language).latestVersion));
										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});

								var node_19 = $.sibling(node_18, 2);

								TableCell(node_19, {
									class: 'py-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_15 = $.text();

										$.template_effect(() => $.set_text(text_15, $.get(language).popularity));
										$.append($$anchor, text_15);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}