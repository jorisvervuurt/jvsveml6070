import { LogicError } from './errors/module';

export class Byte {
    
    /**
     * The internal `Buffer` instance.
     */
    protected _buffer: Buffer;
    
    /**
     * Creates a new `Byte` instance.
     * 
     * @param buffer - An optional `Buffer` instance to use.
     */
    constructor(buffer?: Buffer) {
        this._buffer = (buffer instanceof Buffer) ? buffer : Buffer.alloc(1);
    }

    /**
     * Creates a new `Byte` instance from the values of one or more bits.
     * 
     * @param bits - A map of bit values keyed by the bit index (in binary order, right to left).
     * 
     * @returns The created `Byte` instance.
     */
    public static fromBits(bits: Map<number, number>): Byte {
        const byte = new Byte();
        byte.writeBits(bits);

        return byte;
    }

    /**
     * Creates a new `Byte` instance from a hexadecimal value.
     * 
     * @param hex - A hexadecimal value, e.g. `0x01` (binary `00000001`).
     * 
     * @returns The created `Byte` instance.
     */
    public static fromHex(hex: number): Byte {
        const buffer = Buffer.from([hex]),
            byte = new Byte(buffer);

        return byte;
    }

    /**
     * Reads the value of a specific bit.
     * 
     * @param index - The index of the bit to read (in binary order, right to left). Should be a value from 0 to 7.
     * 
     * @returns The value of the bit.
     */
    public readBit(index: number): number {
        return (this._buffer[0] >> index) % 2;
    }

    /**
     * Reads the values of all eight bits.
     * 
     * @returns A map of bit values keyed by the bit index (in binary order, right to left).
     */
    public readBits(): Map<number, number> {
        const bits = new Map<number, number>();

        for (let index = 0; index < 8; index++) {
            bits.set(index, this.readBit(index));
        }

        return bits;
    }

    /**
     * Writes the value of a specific bit.
     * 
     * @param index - The index of the bit to write (in binary order, right to left). Should be a value from 0 to 7.
     * @param value - The value of the bit.
     * 
     * @throws {@link LogicError}
     * Thrown if an invalid bit index and/or value is provided.
     */
    public writeBit(index: number, value: number): void {
        if (0 > index || 7 < index) {
            throw new LogicError(`Invalid bit index provided. ${index} provided, expected a value from 0 to 7.`);
        }

        if (0 > value || 1 < value) {
            throw new LogicError(`Invalid bit value provided. ${value} provided, expected 0 or 1.`);
        }

        if (0 === value) {
            this._buffer[0] &= ~(1 << index);
        } else {
            this._buffer[0] |= (1 << index);
        }
    }

    /**
     * Writes the values of one or more bits.
     * 
     * @param bits - A map of bit values keyed by the bit index (in binary order, right to left).
     * 
     * @throws {@link LogicError}
     * Thrown if too many bits values are provided, or if invalid bit indexes and/or values are provided.
     */
    public writeBits(bits: Map<number, number>): void {
        if (8 < bits.size) {
            throw new LogicError(`Too many bit values provided. ${bits.size} provided, expected a maximum of 8.`);
        }

        for (const [index, value] of bits.entries()) {
            this.writeBit(index, value);
        }
    }

    /**
     * Returns a `Buffer` instance representing the `Byte` instance.
     * 
     * @returns The `Buffer` instance representing the `Byte` instance.
     */
    public toBuffer(): Buffer {
        return this._buffer;
    }

}
