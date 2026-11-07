import * as $ from 'svelte/internal/server';
import { formatDate } from './util';

export default function Another_ref_format_date($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		formatDate(new Date());
	});
}