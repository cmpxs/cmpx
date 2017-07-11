import { Componet } from './componet';
import { CompileSubject } from './compileSubject';

export abstract class Platform {
    abstract boot(component: any, callback?:(componet: Componet, subject: CompileSubject)=>void): Platform;
}