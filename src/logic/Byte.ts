
import { ByteBits } from './ByteBits';

export class Byte {
    
    /**
     * The internal `Buffer` instance.
     */
    private _buffer: Buffer;
    
    /**
     * `Byte` constructor.
     */
    constructor() {
        this._buffer = Buffer.alloc(1);
    }

    /**
     * Reads the value of a specific bit.
     * 
     * @param index - The index of the bit to read. Should be a value from 0 to 7.
     * @returns A boolean value that represents the value of the bit.
     */
    public readBit(index: number): boolean {
        return 1 === ((this._buffer[0] >> index) % 2);
    }

    /**
     * Reads the values of all eight bits.
     * 
     * @returns An array of booleans representing the bit values (in bit order).
     */
    public readBits(): ByteBits {
        return [
            this.readBit(0),
            this.readBit(1),
            this.readBit(2),
            this.readBit(3),
            this.readBit(4),
            this.readBit(5),
            this.readBit(6),
            this.readBit(7),
        ];
    }

    /**
     * Writes the value of a specific bit.
     * 
     * @param index - The index of the bit to write. Should be a value from 0 to 7.
     * @param value - A boolean value representing the value of the bit.
     */
    public writeBit(index: number, value: boolean): void {
        if (false === value) {
            this._buffer[0] &= ~(1 << index);
        } else {
            this._buffer[0] |= (1 << index);
        }
    }

    /**
     * Writes the values of all eight bits.
     * 
     * @param bits - An array of booleans representing the bit values (in bit order).
     */
    public writeBits(bits: ByteBits): void {
        for (const [index, value] of bits.entries()) {
            this.writeBit(index, value);
        }
    }

    /**
     * Returns a `Buffer` instance representing this `Byte` instance.
     * 
     * @returns The `Buffer` instance representing this `Byte` instance.
     */
    public toBuffer(): Buffer {
        return this._buffer;
    }

    /**
     * Creates a new `Byte` instance from the values of all eight bits.
     * 
     * @param bits - An array of booleans representing the bit values (in bit order).
     */
    public static fromBits(bits: ByteBits): Byte {
        const byte = new Byte();
        byte.writeBits(bits);

        return byte;
    }

}
