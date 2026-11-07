<script lang="ts">
    const {onfoo}:{ // onfoo: (e: { detail: number; }) => void, onfoo: (e: { detail: number; }) => void
        onfoo: (e: { detail: number }) => void // onfoo: (e: { detail: number; }) => void, e: { detail: number; }
    } = $props() // $props(): { onfoo: (e: { detail: number; }) => void; }
    onfoo({detail: 1}) // onfoo({detail: 1}): void
</script>

<button onclick="{e=>{ // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLButtonElement
}}"></button>
<input oninput="{e=>{ // e: Event & { currentTarget: EventTarget & HTMLInputElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLInputElement
}}">
