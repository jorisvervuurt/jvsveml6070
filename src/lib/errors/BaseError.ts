export abstract class BaseError extends Error {

    /**
     * An optional parent `Error` instance.
     */
    public parentError?: Error;

    /**
     * Creates a new `BaseError` instance.
     * 
     * @param message - The error message.
     * @param parentError - An optional parent error (can be either an `Error` instance or a string).
     */
    constructor(message: string, parentError?: Error | string) {
        super(message);

        if ('string' === typeof parentError) {
            this.parentError = new Error(parentError);
        } else {
            this.parentError = parentError;
        }
    }

}
