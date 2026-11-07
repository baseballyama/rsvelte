import 'svelte/internal/disclose-version';
import Heading1 from 'src/mdsvex/h1.svelte';
import Heading2 from 'src/mdsvex/h2.svelte';
import Heading3 from 'src/mdsvex/h3.svelte';
import UnorderedList from 'src/mdsvex/ul.svelte';
import ListItem from 'src/mdsvex/li.svelte';
import Table from 'src/mdsvex/table.svelte';
import TableHead from 'src/mdsvex/th.svelte';
import TableRow from 'src/mdsvex/tr.svelte';
import TableData from 'src/mdsvex/td.svelte';
import Mark from 'src/mdsvex/mark.svelte';
import Paragraph from 'src/mdsvex/p.svelte';
import * as $ from 'svelte/internal/client';

export {
	Heading1 as h1,
	Heading2 as h2,
	Heading3 as h3,
	UnorderedList as ul,
	ListItem as li,
	Table as table,
	TableHead as th,
	TableRow as tr,
	TableData as td,
	Mark as mark,
	Paragraph as p
};

export default function Layout_no_head($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}