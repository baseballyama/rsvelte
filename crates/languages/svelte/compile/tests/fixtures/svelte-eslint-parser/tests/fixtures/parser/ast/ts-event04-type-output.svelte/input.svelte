<script lang="ts">
</script>

<button on:unknown="{e=>{ // e: CustomEvent<any>
    e.currentTarget; // e.currentTarget: EventTarget | null
}}"></button>
