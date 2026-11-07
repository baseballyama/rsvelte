import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconQuestionMarkCircle } from '@appwrite.io/pink-icons-svelte';

export default function QuestionIcon($$anchor) {
	Icon($$anchor, {
		get icon() {
			return IconQuestionMarkCircle;
		}
	});
}