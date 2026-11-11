<script lang="ts">import a from '#lib/Foo.svelte?raw';
import b from '$lib/Foo.svelte?raw';
import c from '$lib/Foo.svelte#frag';
import d from '#lib/Foo.svelte#frag';
import Foo from '#lib/Foo.svelte';</script>
<Foo />{a}{b}{c}{d}
