import { Byte } from './Byte';
import { CommandRegisterBit } from './enums/CommandRegisterBit';
import { IntegrationTime } from './enums/IntegrationTime';
import { ShutdownMode } from './enums/ShutdownMode';
import { CommandRegisterError } from './errors/CommandRegisterError';

export class CommandRegister extends Byte {

    /**
     * Creates a new `CommandRegister` instance.
     * If the optional `Buffer` instance is not provided, the correct initial bit values are set based on the datasheet.
     * 
     * @param buffer - An optional `Buffer` instance to use.
     * 
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     */
    constructor(buffer?: Buffer) {
        super(buffer);
        
        // If no `Buffer` instance is provided, set the initial bit values based on the datasheet.
        if (!(buffer instanceof Buffer)) {
            this.writeBits(new Map([
                // Set the value of the shutdown mode setting bit to 1.
                [CommandRegisterBit.SD, 1],

                // Set the value of the first reserved bit to 1.
                [CommandRegisterBit.RESERVED_0, 1],

                // Set the value of the first integration time setting bit to 1, to match the default 1T integration
                // time.
                [CommandRegisterBit.IT_0, 1],
            ]));
        }
    }

    /**
     * Creates a new `CommandRegister` instance from the values of one or more bits.
     * The initial bit values are set based on the datasheet, but they can be overwritten by passing their values via 
     * the `bits` argument.
     * 
     * @param bits - A map of bit values keyed by the bit index (in binary order, right to left).
     * 
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     */
    public static fromBits(bits: Map<number, number>): CommandRegister {
        const commandRegister: CommandRegister = new CommandRegister();
        commandRegister.writeBits(bits);

        return commandRegister;
    }

    /**
     * Creates a new `CommandRegister` instance from a hexadecimal value.
     * 
     * @param hex - A hexadecimal value, e.g. `0x01` (binary `00000001`).
     */
    public static fromHex(hex: number): Byte {
        const buffer: Buffer = Buffer.from([hex]),
            commandRegister: CommandRegister = new CommandRegister(buffer);

        return commandRegister;
    }

    /**
     * Retrieves the shutdown mode.
     * 
     * @returns The shutdown mode.
     */
    public getShutdownMode(): ShutdownMode {
        return this.readBit(CommandRegisterBit.SD);
    }

    /**
     * Sets the shutdown mode.
     * 
     * @param shutdownMode - The shutdown mode.
     */
    public setShutdownMode(shutdownMode: ShutdownMode): void {
        if (!Number.isInteger(shutdownMode) || !Object.values(ShutdownMode).includes(shutdownMode)) {
            // eslint-disable-next-line max-len
            throw new CommandRegisterError(`Invalid shutdown mode provided. ${shutdownMode} provided, expected a valid \`ShutdownMode\` enum value.`);
        }

        this.writeBit(CommandRegisterBit.SD, shutdownMode);
    }

    /**
     * Retrieves the integration time.
     * 
     * @returns The integration time.
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
            throw new CommandRegisterError(`Invalid integration time provided. ${integrationTime} provided, expected a valid \`IntegrationTime\` enum value.`);
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

    /**
     * Clones the `CommandRegister` instance.
     * 
     * @returns The cloned `CommandRegister` instance.
     */
    public clone(): CommandRegister {
        return CommandRegister.fromBits(this.readBits());
    }

}
