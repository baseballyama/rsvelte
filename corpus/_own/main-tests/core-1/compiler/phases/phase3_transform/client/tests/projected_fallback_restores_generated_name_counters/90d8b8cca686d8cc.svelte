<script lang="ts">
interface Props {
    children?: unknown;
    codeblock?: unknown;
    innerClass?: string;
    class?: string;
}
let { children, codeblock, innerClass, class: classname }: Props = $props();
const { base, inner } = $derived(codewrapper());
</script>

<div class={base({ class: classname })}>{innerClass}</div>
