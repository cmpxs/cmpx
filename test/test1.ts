import { Compile, VM, CompileSubject, HtmlTagDef, Componet, CompileRender } from '../index';

import { expect } from 'chai';
import 'mocha';


import fs = require('fs');

@VM({name:'test'})
class TestCP1 extends Componet{

}

var tmpl = `
<div>

{{ifx this.ok}}
  ifxok
{{else this.aaa}}
  aaaOk
{{else}}
  ifxfalse
  {{if this.okif}}
    testok
  {{else this.FFF}}
    fffok
  {{else}}
     test else
  {{/if}}
{{/ifx}}
  
</div>  
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