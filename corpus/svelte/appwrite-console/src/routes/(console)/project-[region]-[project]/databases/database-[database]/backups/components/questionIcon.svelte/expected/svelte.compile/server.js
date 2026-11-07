import * as $ from 'svelte/internal/server';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconQuestionMarkCircle } from '@appwrite.io/pink-icons-svelte';

export default function QuestionIcon($$renderer) {
	Icon($$renderer, { icon: IconQuestionMarkCircle });
}