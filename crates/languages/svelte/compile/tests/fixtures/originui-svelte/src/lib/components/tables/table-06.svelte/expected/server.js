import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

export default function Table_06($$renderer) {
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

	$$renderer.push(`<div><div class="bg-background overflow-hidden rounded-md border">`);

	Table($$renderer, {
		children: ($$renderer) => {
			TableHeader($$renderer, {
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: 'bg-muted/50',
						children: ($$renderer) => {
							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Release Year`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Developer`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Typing`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Paradigm`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Extension`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Latest Version`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'h-9 py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Popularity`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(programmingLanguages);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let language = each_array[$$index];

						TableRow($$renderer, {
							children: ($$renderer) => {
								TableCell($$renderer, {
									class: 'py-2 font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.releaseYear)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.developer)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.typing)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.paradigm)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.extension)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.latestVersion)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'py-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(language.popularity)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-4 text-center text-sm">Dense table</p></div>`);
}