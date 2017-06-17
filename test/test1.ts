import { Compile, VM, CompileSubject, HtmlTagDef, Componet, CompileRender } from '../index';

import { expect } from 'chai';
import 'mocha';


import fs = require('fs');

var tmpl = `
<div $array="divList">
  {{for item in {} sync}}{{/for}}
  {{for item in {} sync="this.syncFn"}}{{/for}}
  divText
  {{for item in [1]}}
  <span $var="span1" $array="spanList" id="span1" text="{{'asdfafd'}}" style="{{'color:red'}}" > spanText{{>this.user}}{{!"this"}} </span>
  {{/for}}
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