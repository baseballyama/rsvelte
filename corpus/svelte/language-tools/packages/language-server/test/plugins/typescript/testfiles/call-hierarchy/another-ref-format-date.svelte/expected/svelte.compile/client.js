import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatDate } from './util';

export default function Another_ref_format_date($$anchor, $$props) {
	$.push($$props, true);
	formatDate(new Date());
	$.pop();
}