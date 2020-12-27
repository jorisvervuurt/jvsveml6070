import { Byte } from './Byte';
import { CommandBit } from './enums/CommandBit';

export class Command extends Byte {

    /**
     * Constructs a new `Command` instance.
     * Sets the correct initial bit values based on the datasheet.
     * 
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     */
    constructor() {
        super();

        // Set the correct initial bit values based on the datasheet.
        this.writeBits(new Map([
            // Set the value of the first reserved bit to 1.
            [CommandBit.RESERVED_1, 1],

            // Set the value of the first integration time setting bit to 1, to match the default 1T integration time.
            [CommandBit.IT_0, 1],
        ]));
    }

}
