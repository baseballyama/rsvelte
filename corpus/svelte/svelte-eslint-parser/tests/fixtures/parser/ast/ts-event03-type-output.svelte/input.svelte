<script lang="ts">
    import {createEventDispatcher} from 'svelte' // createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>, createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>
    const emit = createEventDispatcher<{ // emit: EventDispatcher<{ foo: number; bar: string; }>, createEventDispatcher<{ foo: number, bar: string }>(): EventDispatcher<{ foo: number; bar: string; }>
        foo: number,
        bar: string
    }>()
    emit('foo', 1) // emit('foo', 1): boolean
</script>

<button on:click="{e=>{ // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLButtonElement
}}"></button>
<input on:input="{e=>{ // e: Event & { currentTarget: EventTarget & HTMLInputElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLInputElement
}}">
