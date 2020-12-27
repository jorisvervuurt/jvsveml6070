export enum CommandBit {
    /**
     * Shutdown mode setting.
     */
    SD = 0,

    /**
     * Reserved.
     */
    RESERVED_1 = 1,

    /**
     * Integration time setting (first bit).
     */
    IT_0 = 2,

    /**
     * Integration time setting (second bit).
     */
    IT_1 = 3,

    /**
     * Acknowledge threshold window setting for byte mode usage.
     */
    ACK_THD = 4,

    /**
     * Acknowledge activity setting.
     */
    ACK = 5,

    /**
     * Reserved.
     */
    RESERVED_6 = 6,

    /**
     * Reserved.
     */
    RESERVED_7 = 7,
}
