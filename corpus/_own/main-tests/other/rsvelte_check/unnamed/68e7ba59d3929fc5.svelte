<script lang="ts">import Foo, { SIZE } from '#lib/components/Foo.svelte';
import { util } from '#lib/util.js';</script>
<Foo n={SIZE + util} />
