import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function PasswordInput_demo_icon($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PasswordInput($$anchor, {
				label: 'Password',
				placeholder: 'Enter password',
				get icon() {
					return LockClosed;
				}
			});
		},
		$$slots: { default: true }
	});
}