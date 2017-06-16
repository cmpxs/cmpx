import { Compile, VM, CompileSubject, HtmlTagDef, Componet, CompileRender } from '../index';

import { expect } from 'chai';
import 'mocha';


import fs = require('fs');

var tmpl = `
<div>
  divText
  <span $var="span1" id="span1" text="{{'asdfafd'}}" style="{{'color:red'}}" > spanText{{>this.user}}{{!"this"}} </span>
  {{tmpl id="tmpl1" let="item = param.item, index = param.index"}}
    tmpl text
  {{/tmpl}}
  {{for userItem in this.users}}
    <div> for div text </div>
    {{include tmpl="tmpl1" param="{item: userItem, $index:$index}" }}
  {{/for}}
  {{tmpl id="tmpl2"}}
    {{item.name}}
  {{/tmpl}}
</div>
<textarea><span>aaa</span></textarea>
<script type="text/html">
sdf<br />
</script>
`;

describe('Compile', () => {
  it('_makeTags', () => {
    console.time('Compile');
    var cp = new CompileRender(tmpl);
    console.timeEnd('Compile');

    let src = __dirname + '/../dist/complieContext.ts'
    fs.writeFileSync(src, cp.contextFn.toString());
    
    // src = __dirname + '/../output/htmlTagObjects.json'
    // fs.writeFileSync(src, JSON.stringify(tags));

    //console.log((tags));

    expect(23 == 23).to.equal(true);
  });
});