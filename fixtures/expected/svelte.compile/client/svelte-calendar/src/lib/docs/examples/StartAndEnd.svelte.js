import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import dayjs from 'dayjs';
import { Datepicker } from '../../index';

export default function StartAndEnd($$anchor, $$props) {
	$.push($$props, true);

	const today = new Date();
	const tomorrow = dayjs().add(1, 'day').toDate();

	Datepicker($$anchor, {
		get start() {
			return today;
		},

		get end() {
			return tomorrow;
		}
	});

	$.pop();
}