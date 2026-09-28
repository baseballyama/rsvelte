import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InlineCalendar } from '../../index';

export default function InlineCalendar_1($$anchor) {
	const theme = {
		calendar: { width: '600px', shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }
	};

	InlineCalendar($$anchor, {
		get theme() {
			return theme;
		}
	});
}