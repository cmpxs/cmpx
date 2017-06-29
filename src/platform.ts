import { Componet } from './componet';

export abstract class Platform {
    abstract boot(component: any): Platform;
}