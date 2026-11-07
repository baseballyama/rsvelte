<script lang="ts">
</script>

<button onunknown="{e=>{ // e: CustomEvent<any>
    e.currentTarget; // e.currentTarget: EventTarget | null
}}"></button>
