import { Byte } from './Byte';
import { CommandRegisterBit } from './enums/CommandRegisterBit';
import { IntegrationTime } from './enums/IntegrationTime';
import { CommandRegisterError } from './errors/CommandRegisterError';

export class CommandRegister extends Byte {

    /**
     * Constructs a new `CommandRegister` instance.
     * Sets the correct initial bit values based on the datasheet.
     * 
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     */
    constructor() {
        super();

        // Set the correct initial bit values based on the datasheet.
        this.writeBits(new Map([
            // Set the value of the first reserved bit to 1.
            [CommandRegisterBit.RESERVED_0, 1],

            // Set the value of the first integration time setting bit to 1, to match the default 1T integration time.
            [CommandRegisterBit.IT_0, 1],
        ]));
    }

    /**
     * Retrieves the current integration time.
     * 
     * @returns The current integration time.
     */
    public getIntegrationTime(): IntegrationTime {
        const firstBitValue: number = this.readBit(CommandRegisterBit.IT_0),
            secondBitValue: number = this.readBit(CommandRegisterBit.IT_1);

        if (0 === firstBitValue && 0 === secondBitValue) {
            return IntegrationTime.IT_HALF_T;
        } else if (1 === firstBitValue && 0 === secondBitValue) {
            return IntegrationTime.IT_1T;
        } else if (0 === firstBitValue && 1 === secondBitValue) {
            return IntegrationTime.IT_2T;
        } else if (1 === firstBitValue && 1 === secondBitValue) {
            return IntegrationTime.IT_4T;
        }

        return IntegrationTime.IT_1T;
    }

    /**
     * Sets the integration time.
     * 
     * @param integrationTime - The integration time.
     */
    public setIntegrationTime(integrationTime: IntegrationTime): void {
        if (!Number.isInteger(integrationTime) || !Object.values(IntegrationTime).includes(integrationTime)) {
            // eslint-disable-next-line max-len
            throw new CommandRegisterError(`Invalid integration time provided! ${integrationTime} provided, expected a valid \`IntegrationTime\` enum value.`);
        }

        let firstBitValue: number = this.readBit(CommandRegisterBit.IT_0),
            secondBitValue: number = this.readBit(CommandRegisterBit.IT_1);

        switch (integrationTime) {
            case IntegrationTime.IT_HALF_T:
                firstBitValue = 0;
                secondBitValue = 0;
                break;
            case IntegrationTime.IT_1T:
                firstBitValue = 1;
                secondBitValue = 0;
                break;
            case IntegrationTime.IT_2T:
                firstBitValue = 0;
                secondBitValue = 1;
                break;
            case IntegrationTime.IT_4T:
                firstBitValue = 1;
                secondBitValue = 1;
                break;
        }

        this.writeBits(new Map([
            [CommandRegisterBit.IT_0, firstBitValue],
            [CommandRegisterBit.IT_1, secondBitValue],
        ]));
    }

}
