<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    const emit = createEventDispatcher<{
        foo: number,
        bar: string
    }>()
    emit('foo', 1)
</script>

<button on:click="{e=>{
    e.currentTarget;
}}"></button>
<input on:input="{e=>{
    e.currentTarget;
}}">
