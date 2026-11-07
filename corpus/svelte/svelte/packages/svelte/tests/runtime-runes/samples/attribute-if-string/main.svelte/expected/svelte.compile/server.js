import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div class="translate-false"><div${$.attr('translate', false)}></div> <div translate="no"></div> <div${$.attributes({ ...{ translate: false } })}></div> <div${$.attributes({ ...{ translate: 'no' } })}></div></div> <div class="translate-true"><div></div> <div${$.attr('translate', true)}></div> <div translate="yes"></div> <div${$.attributes({ ...{ translate: true } })}></div> <div${$.attributes({ ...{ translate: 'yes' } })}></div> <div translate="false"></div> <div translate="banana"></div> <div${$.attributes({ ...{ translate: 'false' } })}></div> <div${$.attributes({ ...{ translate: 'banana' } })}></div></div>`);
}