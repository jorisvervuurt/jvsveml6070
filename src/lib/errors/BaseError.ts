export abstract class BaseError extends Error {

    /**
     * The parent `Error` instance. Optional.
     */
    public parentError?: Error;

    /**
     * Creates a new `BaseError` instance.
     * 
     * @param message - The error message.
     * @param parentError - The parent error (can be both an `Error` instance or a string). Optional.
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
