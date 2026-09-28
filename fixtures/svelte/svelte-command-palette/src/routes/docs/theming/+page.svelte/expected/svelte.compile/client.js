import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1>Theming</h1> <p class="lead svelte-1xfzdbj">Create beautiful, branded command palettes with full theming support.
	Switch between themes dynamically based on user preference.</p> <h2>Theme Object Pattern</h2> <p>The recommended approach is to create theme objects and spread them:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Theme Object Pattern</span></div> <pre><code></code></pre></div> <h2>Theme Presets</h2> <p>Here are some ready-to-use theme inspirations:</p> <h3>Linear-Inspired Theme</h3> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Linear Theme</span></div> <pre><code></code></pre></div> <h3>GitHub-Inspired Theme</h3> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>GitHub Theme</span></div> <pre><code></code></pre></div> <h2>CSS Variables</h2> <p>You can also theme using CSS variables for a more declarative approach:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>CSS Variables</span></div> <pre><code></code></pre></div> <h2>Tailwind Integration</h2> <p>Use Tailwind classes directly for rapid theming:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Tailwind Classes</span></div> <pre><code></code></pre></div>`,
	1
);

export default function _page($$anchor) {
	const themeObjectExample = `<script lang="ts">
  import { writable } from 'svelte/store';
  
  // Create a theme store
  const isDark = writable(true);
  
  // Define theme configurations
  const themes = {
    dark: {
      inputStyle: { 
        background: '#1f2937', 
        color: '#f9fafb',
        border: '1px solid #374151'
      },
      paletteWrapperInnerStyle: { 
        background: '#1f2937',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      },
      resultsContainerStyle: { background: '#1f2937' },
      resultContainerStyle: { borderRadius: '8px' },
      optionSelectedStyle: { background: '#374151' },
      titleStyle: { color: '#f9fafb' },
      subtitleStyle: { color: '#9ca3af' },
      keyboardButtonStyle: { 
        background: '#374151', 
        color: '#9ca3af',
        border: '1px solid #4b5563'
      }
    },
    light: {
      inputStyle: { 
        background: '#ffffff', 
        color: '#111827',
        border: '1px solid #e5e7eb'
      },
      paletteWrapperInnerStyle: { 
        background: '#ffffff',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
      },
      resultsContainerStyle: { background: '#ffffff' },
      resultContainerStyle: { borderRadius: '8px' },
      optionSelectedStyle: { background: '#f3f4f6' },
      titleStyle: { color: '#111827' },
      subtitleStyle: { color: '#6b7280' },
      keyboardButtonStyle: { 
        background: '#f3f4f6', 
        color: '#6b7280',
        border: '1px solid #e5e7eb'
      }
    }
  };
  
  $: currentTheme = $isDark ? themes.dark : themes.light;
<\/script>

<CommandPalette
  commands={actions}
  {...currentTheme}
/>`;

	const linearTheme = `// Linear-inspired theme
const linearTheme = {
  overlayStyle: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)'
  },
  paletteWrapperInnerStyle: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px'
  },
  inputStyle: {
    background: 'transparent',
    color: '#ffffff',
    fontSize: '18px'
  },
  optionSelectedStyle: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderLeft: '2px solid #6366f1'
  }
};`;

	const githubTheme = `// GitHub-inspired theme
const githubTheme = {
  overlayStyle: {
    background: 'rgba(27, 31, 36, 0.5)'
  },
  paletteWrapperInnerStyle: {
    background: '#ffffff',
    border: '1px solid #d0d7de',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(140, 149, 159, 0.2)'
  },
  inputStyle: {
    background: '#f6f8fa',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    padding: '8px 12px'
  },
  optionSelectedStyle: {
    background: '#f6f8fa'
  },
  titleStyle: {
    color: '#24292f',
    fontWeight: '600'
  }
};`;

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 8);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = '<script lang="ts">\n  import { writable } from \'svelte/store\';\n  \n  // Create a theme store\n  const isDark = writable(true);\n  \n  // Define theme configurations\n  const themes = {\n    dark: {\n      inputStyle: { \n        background: \'#1f2937\', \n        color: \'#f9fafb\',\n        border: \'1px solid #374151\'\n      },\n      paletteWrapperInnerStyle: { \n        background: \'#1f2937\',\n        boxShadow: \'0 25px 50px rgba(0,0,0,0.5)\'\n      },\n      resultsContainerStyle: { background: \'#1f2937\' },\n      resultContainerStyle: { borderRadius: \'8px\' },\n      optionSelectedStyle: { background: \'#374151\' },\n      titleStyle: { color: \'#f9fafb\' },\n      subtitleStyle: { color: \'#9ca3af\' },\n      keyboardButtonStyle: { \n        background: \'#374151\', \n        color: \'#9ca3af\',\n        border: \'1px solid #4b5563\'\n      }\n    },\n    light: {\n      inputStyle: { \n        background: \'#ffffff\', \n        color: \'#111827\',\n        border: \'1px solid #e5e7eb\'\n      },\n      paletteWrapperInnerStyle: { \n        background: \'#ffffff\',\n        boxShadow: \'0 25px 50px rgba(0,0,0,0.15)\'\n      },\n      resultsContainerStyle: { background: \'#ffffff\' },\n      resultContainerStyle: { borderRadius: \'8px\' },\n      optionSelectedStyle: { background: \'#f3f4f6\' },\n      titleStyle: { color: \'#111827\' },\n      subtitleStyle: { color: \'#6b7280\' },\n      keyboardButtonStyle: { \n        background: \'#f3f4f6\', \n        color: \'#6b7280\',\n        border: \'1px solid #e5e7eb\'\n      }\n    }\n  };\n  \n  $: currentTheme = $isDark ? themes.dark : themes.light;\n</script>\n\n<CommandPalette\n  commands={actions}\n  {...currentTheme}\n/>';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 8);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = '// Linear-inspired theme\nconst linearTheme = {\n  overlayStyle: {\n    background: \'rgba(0, 0, 0, 0.6)\',\n    backdropFilter: \'blur(8px)\'\n  },\n  paletteWrapperInnerStyle: {\n    background: \'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)\',\n    border: \'1px solid rgba(255, 255, 255, 0.1)\',\n    borderRadius: \'16px\'\n  },\n  inputStyle: {\n    background: \'transparent\',\n    color: \'#ffffff\',\n    fontSize: \'18px\'\n  },\n  optionSelectedStyle: {\n    background: \'rgba(99, 102, 241, 0.15)\',\n    borderLeft: \'2px solid #6366f1\'\n  }\n};';
	$.reset(pre_1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var pre_2 = $.sibling($.child(div_2), 2);
	var code_2 = $.child(pre_2);

	code_2.textContent = '// GitHub-inspired theme\nconst githubTheme = {\n  overlayStyle: {\n    background: \'rgba(27, 31, 36, 0.5)\'\n  },\n  paletteWrapperInnerStyle: {\n    background: \'#ffffff\',\n    border: \'1px solid #d0d7de\',\n    borderRadius: \'12px\',\n    boxShadow: \'0 8px 24px rgba(140, 149, 159, 0.2)\'\n  },\n  inputStyle: {\n    background: \'#f6f8fa\',\n    border: \'1px solid #d0d7de\',\n    borderRadius: \'6px\',\n    padding: \'8px 12px\'\n  },\n  optionSelectedStyle: {\n    background: \'#f6f8fa\'\n  },\n  titleStyle: {\n    color: \'#24292f\',\n    fontWeight: \'600\'\n  }\n};';
	$.reset(pre_2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 6);
	var pre_3 = $.sibling($.child(div_3), 2);
	var code_3 = $.child(pre_3);

	code_3.textContent = ':root {\n  --cp-bg: #1f2937;\n  --cp-text: #f9fafb;\n  --cp-border: #374151;\n  --cp-accent: #6366f1;\n}\n\n.light {\n  --cp-bg: #ffffff;\n  --cp-text: #111827;\n  --cp-border: #e5e7eb;\n  --cp-accent: #4f46e5;\n}';
	$.reset(pre_3);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 6);
	var pre_4 = $.sibling($.child(div_4), 2);
	var code_4 = $.child(pre_4);

	code_4.textContent = '<CommandPalette\n  commands={actions}\n  overlayClass="bg-black/50 backdrop-blur-sm"\n  paletteWrapperInnerClass="bg-white dark:bg-gray-900 rounded-xl shadow-2xl"\n  inputClass="bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"\n  resultContainerClass="hover:bg-gray-100 dark:hover:bg-gray-800"\n  optionSelectedClass="bg-indigo-50 dark:bg-indigo-900/30"\n/>';
	$.reset(pre_4);
	$.reset(div_4);
	$.append($$anchor, fragment);
}