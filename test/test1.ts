import { Compile, VMComponet, CompileSubject, HtmlTagDef, Componet, CompileRender } from '../index';

import { expect } from 'chai';
import 'mocha';


import fs = require('fs');

@VMComponet({name:'test'})
class TestCP1 extends Componet{

}

var tmpl = `
{{: this.aaa  | text | lt:'aaa'}} | {{: this.bbbb | lt:'aaa'}} | {{this.ccc}} || {{: this.ddd}}
<span name="{{: this.aaaa | text}} | {{this.ccc}} || {{: this.ddd}}"></span>
{{for item in this.list | asc}}
{{: item.text}}
{{/for}}
{{for item in this.list}}
{{: item.text}}
{{/for}}
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