import * as $ from 'svelte/internal/server';
import dayjs from 'dayjs';
import { Datepicker } from '../../index';

export default function StartAndEnd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = new Date();
		const tomorrow = dayjs().add(1, 'day').toDate();

		Datepicker($$renderer, { start: today, end: tomorrow });
	});
}