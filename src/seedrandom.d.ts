declare module 'seedrandom' {
    interface PRNG {
        (): number;
        quick(): number;
        int32(): number;
        double(): number;
    }

    interface seedrandom {
        (seed?: string, options?: { entropy?: boolean }): PRNG;
    }

    const seedrandom: seedrandom;
    export = seedrandom;
}
