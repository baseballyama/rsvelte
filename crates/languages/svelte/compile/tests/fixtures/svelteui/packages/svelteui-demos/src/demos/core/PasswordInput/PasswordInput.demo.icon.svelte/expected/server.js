import * as $ from 'svelte/internal/server';
import { Center, PasswordInput } from '@svelteuidev/core';
import { LockClosed } from 'radix-icons-svelte';

const code = `
<script>
  import { PasswordInput } from '@svelteuidev/core';
  import { LockClosed } from 'radix-icons-svelte';
<\/script>

<PasswordInput
  label='Password'
  placeholder='Enter password'
  icon={LockClosed}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function PasswordInput_demo_icon($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			PasswordInput($$renderer, {
				label: 'Password',
				placeholder: 'Enter password',
				icon: LockClosed
			});
		},
		$$slots: { default: true }
	});
}