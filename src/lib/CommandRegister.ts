import { Byte } from './module';
import {
    CommandRegisterBit,
    AcknowledgeMode,
    AcknowledgeThreshold,
    IntegrationTime,
    ShutdownMode,
} from './enums/module';
import { CommandRegisterError } from './errors/module';

export class CommandRegister extends Byte {

    /**
     * Creates a new `CommandRegister` instance.
     * If the optional `Buffer` instance is not provided, the correct initial bit values are set based on the datasheet.
     * 
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     * 
     * @param buffer - An optional `Buffer` instance to use.
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
     * @see {@link https://www.vishay.com/docs/84277/veml6070.pdf|Vishay VEML6070 datasheet}, pages 6 to 8.
     * 
     * @param bits - A map of bit values keyed by the bit index (in binary order, right to left).
     * 
     * @returns The created `CommandRegister` instance.
     */
    public static fromBits(bits: Map<number, number>): CommandRegister {
        const commandRegister = new CommandRegister();
        commandRegister.writeBits(bits);

        return commandRegister;
    }

    /**
     * Creates a new `CommandRegister` instance from a hexadecimal value.
     * 
     * @param hex - A hexadecimal value, e.g. `0x01` (binary `00000001`).
     * 
     * @returns The created `CommandRegister` instance.
     */
    public static fromHex(hex: number): Byte {
        const buffer = Buffer.from([hex]),
            commandRegister = new CommandRegister(buffer);

        return commandRegister;
    }

    /**
     * Retrieves the shutdown mode.
     * 
     * @returns The `ShutdownMode` enumeration value.
     */
    public getShutdownMode(): ShutdownMode {
        return this.readBit(CommandRegisterBit.SD);
    }

    /**
     * Sets the shutdown mode.
     * 
     * @param shutdownMode - The `ShutdownMode` enumeration value.
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
     * @returns The `IntegrationTime` enumeration value.
     */
    public getIntegrationTime(): IntegrationTime {
        const firstBitValue = this.readBit(CommandRegisterBit.IT_0),
            secondBitValue = this.readBit(CommandRegisterBit.IT_1);

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
     * @param integrationTime - The `IntegrationTime` enumeration value.
     */
    public setIntegrationTime(integrationTime: IntegrationTime): void {
        if (!Number.isInteger(integrationTime) || !Object.values(IntegrationTime).includes(integrationTime)) {
            // eslint-disable-next-line max-len
            throw new CommandRegisterError(`Invalid integration time provided. ${integrationTime} provided, expected a valid \`IntegrationTime\` enum value.`);
        }

        let firstBitValue = this.readBit(CommandRegisterBit.IT_0),
            secondBitValue = this.readBit(CommandRegisterBit.IT_1);

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
     * Retrieves the acknowledge mode.
     * 
     * @returns The `AcknowledgeMode` enumeration value.
     */
    public getAcknowledgeMode(): AcknowledgeMode {
        return this.readBit(CommandRegisterBit.ACK);
    }

    /**
     * Sets the acknowledge mode.
     * 
     * @param ackMode - The `AcknowledgeMode` enumeration value.
     */
    public setAcknowledgeMode(ackMode: AcknowledgeMode): void {
        if (!Number.isInteger(ackMode) || !Object.values(AcknowledgeMode).includes(ackMode)) {
            // eslint-disable-next-line max-len
            throw new CommandRegisterError(`Invalid acknowledge mode provided. ${ackMode} provided, expected a valid \`AcknowledgeMode\` enum value.`);
        }

        this.writeBit(CommandRegisterBit.ACK, ackMode);
    }

    /**
     * Retrieves the acknowledge threshold.
     * 
     * @returns The `AcknowledgeThreshold` enumeration value.
     */
    public getAcknowledgeThreshold(): AcknowledgeThreshold {
        return this.readBit(CommandRegisterBit.ACK_THD);
    }

    /**
     * Sets the acknowledge threshold.
     * 
     * @param ackThreshold - The `AcknowledgeThreshold` enumeration value.
     */
    public setAcknowledgeThreshold(ackThreshold: AcknowledgeThreshold): void {
        if (!Number.isInteger(ackThreshold) || !Object.values(AcknowledgeThreshold).includes(ackThreshold)) {
            // eslint-disable-next-line max-len
            throw new CommandRegisterError(`Invalid acknowledge threshold provided. ${ackThreshold} provided, expected a valid \`AcknowledgeThreshold\` enum value.`);
        }

        this.writeBit(CommandRegisterBit.ACK_THD, ackThreshold);
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
