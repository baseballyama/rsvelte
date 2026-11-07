import * as $ from 'svelte/internal/server';
import { InlineCalendar } from '../../index';

export default function InlineCalendar_1($$renderer) {
	const theme = {
		calendar: { width: '600px', shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }
	};

	InlineCalendar($$renderer, { theme });
}