<script module>const greeting = "hi";</script>
<script>import Icon from "./Icon.svelte"; let { name } = $props();</script>
{#snippet plain()}<Icon />{greeting}{/snippet}
{#snippet uses_prop()}<b>{name}</b>{/snippet}
{#snippet calls_plain()}{@render plain()}{/snippet}
{@render plain()}
<p>{@render uses_prop()}</p>
{@render calls_plain()}
