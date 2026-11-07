<script lang="ts">
	import { isGradeAchieved } from './grades.js';

	export interface Props {
		/** placeholder, falls back to `Lorem Ipsum` */
		placeholder?: string | undefined;
		/** size of the text */
		size?: 'normal' | 'large' | undefined;
		/** required WCAG contrast level */
		a11yLevel: 'AA' | 'AAA';
		/** placeholder text color */
		textColor: string;
		/** placeholder background color */
		bgColor: string;
		/** RGAA contrast between the text and its background. Between 1 and 21 */
		contrast?: number;
		/** define the accessibility "contrast" text */
		contrastText: string;
	}

	let {
		placeholder = undefined,
		size = undefined,
		a11yLevel,
		textColor,
		bgColor,
		contrast = 1,
		contrastText
	}: Props = $props();
</script>

<p class="lorem" class:large={size === 'large'} style:color={textColor} style:background-color={bgColor}>
	{placeholder || 'Lorem Ipsum'}
</p>
<div>
	<p>{contrastText} {contrast >= 10 ? contrast.toFixed(1) : contrast}</p>
	<span class="grade" class:grade-ok={isGradeAchieved(contrast, size, 'AA')}>AA</span>
	{#if a11yLevel === 'AAA'}
		<span class="grade" class:grade-ok={isGradeAchieved(contrast, size, 'AAA')}>AAA</span>
	{/if}
</div>

<!-- 
@component accessibility notice for a single color — this component is meant to be used with the A11yVariant object as a variant to display the accessibility notice.

**Import**
```js
import { A11yVariant } from 'svelte-awesome-color-picker';
```

**Use**
```svelte
<ColorPicker bind:hex components={A11yVariant} />
```

**Props**
@prop placeholder: string | undefined = undefined — placeholder, falls back to `Lorem Ipsum`
@prop size: 'normal' | 'large' | undefined = undefined — size of the text
@prop a11yLevel: 'AA' | 'AAA' — required WCAG contrast level
@prop textColor: string — placeholder text color
@prop bgColor: string — placeholder background color
@prop contrast: number = 1 — RGAA contrast between the text and its background. Between 1 and 21
@prop contrastText: string — define the accessibility "contrast" text
-->
<style>
	.lorem {
		flex: 1;
		text-align: center;
		padding: 4px 8px;
		margin-top: 10px;
		border-radius: 4px;
		border: 1px solid black;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.large {
		font-size: 22px;
		padding: 2px 8px;
	}

	.grade {
		border-radius: 50px;
		padding: 0 8px 2px;
		background-color: #ff6100;
		font-weight: bold;
	}

	.grade-ok {
		background-color: green;
		color: white;
	}

	p {
		margin: 0;
	}
</style>
