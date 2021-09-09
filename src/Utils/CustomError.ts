export class CustomError implements Error {
    name: string;
    message: string;
    stack?: string;
    
    constructor(msg:string) {
        this.name = "CustomError"
        this.message = msg;
    }

    toString(){
        return this.message;
    }
}