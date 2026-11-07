import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="test" role="article">link</a> <a href="test" role="banner">link</a> <a href="test" role="complementary">link</a> <a href="test" role="img">link</a> <a href="test" role="listitem">link</a> <a href="test" role="main">link</a> <a href="test" role="region">link</a> <a href="test" role="tooltip">link</a> <a href="test" role="button">link</a> <button role="article">button</button> <button role="banner">button</button> <button role="complementary">button</button> <button role="img">button</button> <button role="listitem">button</button> <button role="main">button</button> <button role="region">button</button> <button role="tooltip">button</button> <button role="button">button</button> <input role="article"/> <input role="banner"/> <input role="complementary"/> <input role="img"/> <input role="listitem"/> <input role="main"/> <input role="region"/> <input role="tooltip"/> <input role="button"/> <select role="article"></select> <select role="banner"></select> <select role="complementary"></select> <select role="img"></select> <select role="listitem"></select> <select role="main"></select> <select role="region"></select> <select role="tooltip"></select> <select role="button"></select> <textarea role="article"></textarea> <textarea role="banner"></textarea> <textarea role="complementary"></textarea> <textarea role="img"></textarea> <textarea role="listitem"></textarea> <textarea role="main"></textarea> <textarea role="region"></textarea> <textarea role="tooltip"></textarea> <textarea role="button"></textarea> <div role="command"></div> <div role="composite"></div> <div role="input"></div> <div role="landmark"></div> <div role="range"></div> <div role="roletype"></div> <div role="section"></div> <div role="sectionhead"></div> <div role="select"></div> <div role="structure"></div> <div role="tablist"></div> <div role="toolbar"></div> <div role="tree"></div> <div role="treegrid"></div> <div role="widget"></div> <div role="window"></div> <div role="button"></div> <div role="checkbox"></div> <div role="columnheader"></div> <div role="combobox"></div> <div role="grid"></div> <div role="gridcell"></div> <div role="link"></div> <div role="listbox"></div> <div role="menu"></div> <div role="menubar"></div> <div role="menuitem"></div> <div role="menuitemcheckbox" aria-checked="true"></div> <div role="menuitemradio" aria-checked="true"></div> <div role="option" aria-selected="true"></div> <div role="progressbar"></div> <div role="radio" aria-checked="true"></div> <div role="radiogroup"></div> <div role="row"></div> <div role="rowheader"></div> <div role="scrollbar"></div> <div role="searchbox"></div> <div role="slider"></div> <div role="spinbutton"></div> <div role="switch" aria-checked="true"></div> <div role="tab"></div> <div role="textbox"></div> <div role="treeitem"></div> <div role="alert"></div> <div role="alertdialog"></div> <div role="application"></div> <div role="article"></div> <div role="banner"></div> <div role="cell"></div> <div role="complementary"></div> <div role="contentinfo"></div> <div role="definition"></div> <div role="dialog"></div> <div role="directory"></div> <div role="document"></div> <div role="feed"></div> <div role="figure"></div> <div role="form"></div> <div role="group"></div> <div role="heading" aria-level="1"></div> <div role="img"></div> <div role="list"></div> <div role="listitem"></div> <div role="log"></div> <div role="main"></div> <div role="marquee"></div> <div role="math"></div> <div role="navigation"></div> <div role="note"></div> <div role="region"></div> <div role="rowgroup"></div> <div role="search"></div> <div role="separator"></div> <div role="scrollbar" aria-controls="x" aria-valuenow="0"></div> <div role="status"></div> <div role="table"></div> <div role="tabpanel"></div> <div role="term"></div> <div role="timer"></div> <div role="tooltip"></div> <menuitem role="listitem"></menuitem> <option class="foo" role="listitem"></option> <select class="foo" role="listitem"></select> <textarea class="foo" role="listitem"></textarea> <tr role="listitem"></tr> <summary role="listitem"></summary>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 124);

	$.set_attribute(div, 'aria-checked', true);

	var div_1 = $.sibling(div, 4);

	$.set_attribute(div_1, 'aria-controls', []);
	$.set_attribute(div_1, 'aria-expanded', true);

	var div_2 = $.sibling(div_1, 32);

	$.set_attribute(div_2, 'aria-controls', []);
	$.set_attribute(div_2, 'aria-valuenow', 0);

	var div_3 = $.sibling(div_2, 4);

	$.set_attribute(div_3, 'aria-valuenow', 0);

	var div_4 = $.sibling(div_3, 10);

	$.set_attribute(div_4, 'aria-selected', true);
	$.next(86);
	$.append($$anchor, fragment);
}