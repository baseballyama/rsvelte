<svelte:options runes />

<b>{$$slots.header ? 1 : 2}</b>
<slot name="header" />
